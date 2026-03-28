const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const NOTES_FILE_PATH = path.join(app.getPath("userData"), "notes.json");

/** @type {Map<string, BrowserWindow>} */
const noteWindows = new Map();
/** @type {Map<string, NodeJS.Timeout>} */
const saveTimers = new Map();

let isQuitting = false;
let tray = null;
app.on("before-quit", () => {
  isQuitting = true;
});

function ensureNotesFile() {
  const dataDir = path.dirname(NOTES_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(NOTES_FILE_PATH)) {
    fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify([], null, 2), "utf8");
    return;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(NOTES_FILE_PATH, "utf8"));
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify([], null, 2), "utf8");
    }
  } catch {
    fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

function readNotes() {
  ensureNotesFile();
  return JSON.parse(fs.readFileSync(NOTES_FILE_PATH, "utf8"));
}

function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes, null, 2), "utf8");
}

function updateNoteById(noteId, patch) {
  const notes = readNotes();
  const updatedNotes = notes.map((note) => (note.id === noteId ? { ...note, ...patch } : note));
  writeNotes(updatedNotes);
  return updatedNotes.find((n) => n.id === noteId) || null;
}

function createNoteWindow(note) {
  const win = new BrowserWindow({
    width: note.size.width,
    height: note.size.height,
    x: note.position.x,
    y: note.position.y,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: Boolean(note.isFloating),
    resizable: !note.isCollapsed,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  noteWindows.set(note.id, win);

  win.loadFile(path.join(__dirname, "renderer", "note.html"), {
    query: { noteId: note.id }
  });

  const scheduleBoundsSave = () => {
    if (saveTimers.has(note.id)) {
      clearTimeout(saveTimers.get(note.id));
    }

    const timer = setTimeout(() => {
      const bounds = win.getBounds();
      const updated = updateNoteById(note.id, {
        position: { x: bounds.x, y: bounds.y },
        size: { width: bounds.width, height: bounds.height }
      });

      if (updated) {
        win.setAlwaysOnTop(Boolean(updated.isFloating));
      }
    }, 1000);

    saveTimers.set(note.id, timer);
  };

  win.on("move", scheduleBoundsSave);
  win.on("resize", scheduleBoundsSave);
  win.on("closed", () => {
    noteWindows.delete(note.id);
    if (saveTimers.has(note.id)) {
      clearTimeout(saveTimers.get(note.id));
      saveTimers.delete(note.id);
    }
  });

  return win;
}

function createAllWindows() {
  const notes = readNotes();
  console.log(`[Startup] Loaded ${notes.length} notes from notes.json`);
  notes.forEach((note) => {
    if (!noteWindows.has(note.id)) {
      createNoteWindow(note);
    }
  });
}

function createNewNote() {
  const notes = readNotes();
  const newNote = {
    id: crypto.randomUUID(),
    content: "",
    color: "yellow",
    position: { x: 160 + notes.length * 24, y: 160 + notes.length * 24 },
    size: { width: 320, height: 320 },
    isFloating: false,
    isTranslucent: false,
    isCollapsed: false
  };

  notes.push(newNote);
  writeNotes(notes);
  createNoteWindow(newNote);
  return newNote;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (noteWindows.size > 0) {
      const firstWin = Array.from(noteWindows.values())[0];
      if (firstWin) {
        if (firstWin.isMinimized()) firstWin.restore();
        firstWin.focus();
      }
    }
  });

  app.whenReady().then(() => {
    // 1. & 2. Create tray icon with color square fallback
    let trayIcon;
    const iconPath = path.join(__dirname, "assets", "icon.ico");
    
    try {
      trayIcon = nativeImage.createFromPath(iconPath);
      
      // If the file is missing or invalid, createFallback
      if (trayIcon.isEmpty()) {
        console.warn("[Tray] icon.ico is empty or missing, creating color fallback");
        // Create a 16x16 yellow square (Stickies yellow: #FFD200)
        const size = 16;
        const buffer = Buffer.alloc(size * size * 4);
        for (let i = 0; i < size * size * 4; i += 4) {
          buffer[i] = 255;     // R
          buffer[i + 1] = 210; // G
          buffer[i + 2] = 0;   // B
          buffer[i + 3] = 255; // A
        }
        trayIcon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
      }
    } catch (err) {
      console.error("[Tray] Error loading icon:", err);
      // 3. Fallback to empty if everything fails
      trayIcon = nativeImage.createEmpty();
    }

    try {
      // 4. tray variable is declared at the top level (line 14)
      tray = new Tray(trayIcon);
    } catch (err) {
      console.error("[Tray] Critical failure creating tray:", err);
      return;
    }

    const contextMenu = Menu.buildFromTemplate([
      { label: "New Note", click: () => createNewNote() },
      { label: "Show All Notes", click: () => createAllWindows() },
      { type: "separator" },
      { label: "Quit", click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip("WinStickies");
    tray.setContextMenu(contextMenu);

    ensureNotesFile();
    if (BrowserWindow.getAllWindows().length === 0) {
      createAllWindows();
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createAllWindows();
      }
    });
  });
}

app.on("window-all-closed", () => {
  // Do nothing so the app stays running in the tray background
});

ipcMain.handle("notes:getById", (_event, noteId) => {
  return readNotes().find((n) => n.id === noteId) || null;
});

ipcMain.handle("notes:update", (_event, noteId, patch) => {
  const updated = updateNoteById(noteId, patch);
  if (!updated) {
    return null;
  }

  const win = noteWindows.get(noteId);
  if (win && !win.isDestroyed()) {
    if (Object.prototype.hasOwnProperty.call(patch, "isFloating")) {
      win.setAlwaysOnTop(Boolean(updated.isFloating));
    }

    if (Object.prototype.hasOwnProperty.call(patch, "isCollapsed")) {
      win.setResizable(!updated.isCollapsed);
      const bounds = win.getBounds();
      if (updated.isCollapsed) {
        win.setSize(bounds.width, 42);
      } else {
        win.setSize(updated.size.width, updated.size.height);
      }
    }
  }

  return updated;
});

ipcMain.handle("notes:create", () => {
  return createNewNote();
});

ipcMain.handle("notes:close", (_event, noteId) => {
  const win = noteWindows.get(noteId);
  if (win && !win.isDestroyed()) {
    win.close();
  }
  return true;
});
