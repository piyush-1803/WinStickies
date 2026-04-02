const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('noteId');

let currentNote = null;
let saveTimeout = null;

const container = document.getElementById("note-container");
const contentEl = document.getElementById("content");
const closeBtn = document.getElementById("close-btn");
const saveBtn = document.getElementById("save-btn");
const newBtn = document.getElementById("new-btn");
const floatBtn = document.getElementById("float-btn");
const translucentBtn = document.getElementById("translucent-btn");
const colorDots = document.querySelectorAll(".color-dot");

function updateUI(note) {
  currentNote = note;
  
  // Set content only if it's the first load to prevent cursor jumps
  if (contentEl.innerHTML === "" && document.activeElement !== contentEl) {
    // Preserve basic line breaks
    contentEl.innerHTML = note.content || "";
  }
  
  // Restore color
  container.className = "note-container"; // reset
  container.classList.add(note.color);
  
  // Translucent toggle
  if (note.isTranslucent) {
    container.classList.add("translucent");
    translucentBtn.classList.add("active");
  } else {
    translucentBtn.classList.remove("active");
  }

  // Float toggle
  if (note.isFloating) {
    floatBtn.classList.add("active");
  } else {
    floatBtn.classList.remove("active");
  }
  
  // Collapse toggle
  if (note.isCollapsed) {
    container.classList.add("collapsed");
  } else {
    container.classList.remove("collapsed");
  }
}

// Initialization
window.addEventListener("DOMContentLoaded", async () => {
  if (!window.winStickies) return;
  const note = await window.winStickies.getNoteById(noteId);
  if (note) updateUI(note);
});

// Auto-save on typing
contentEl.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (!window.winStickies) return;
    window.winStickies.updateNote(noteId, { content: contentEl.innerHTML });
  }, 1000);
});

// Actions
closeBtn.addEventListener("click", async () => {
  if (window.winStickies) {
    if (saveTimeout) clearTimeout(saveTimeout);
    await window.winStickies.deleteNote(noteId);
  }
});

saveBtn.addEventListener("click", async () => {
  if (!window.winStickies) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  await window.winStickies.updateNote(noteId, { content: contentEl.innerHTML });
  
  // Visual feedback: briefly blink green
  saveBtn.classList.add("saved");
  setTimeout(() => {
    saveBtn.classList.remove("saved");
  }, 1000);
});

newBtn.addEventListener("click", () => {
  if (window.winStickies) window.winStickies.createNote();
});

floatBtn.addEventListener("click", async () => {
  if (!currentNote || !window.winStickies) return;
  const isFloating = !currentNote.isFloating;
  currentNote.isFloating = isFloating;
  floatBtn.classList.toggle("active", isFloating);
  await window.winStickies.updateNote(noteId, { isFloating });
});

translucentBtn.addEventListener("click", async () => {
  if (!currentNote || !window.winStickies) return;
  const isTranslucent = !currentNote.isTranslucent;
  currentNote.isTranslucent = isTranslucent;
  container.classList.toggle("translucent", isTranslucent);
  translucentBtn.classList.toggle("active", isTranslucent);
  await window.winStickies.updateNote(noteId, { isTranslucent });
});

colorDots.forEach(dot => {
  dot.addEventListener("click", async () => {
    if (!currentNote || !window.winStickies) return;
    const color = dot.dataset.color;
    currentNote.color = color;
    container.className = "note-container"; // reset
    if (currentNote.isTranslucent) container.classList.add("translucent");
    if (currentNote.isCollapsed) container.classList.add("collapsed");
    container.classList.add(color);
    await window.winStickies.updateNote(noteId, { color });
  });
});

// ── Tools Sidebar ──
const toolsToggle = document.getElementById("tools-toggle");
const toolsPanel = document.getElementById("tools-panel");
const bulletBtn = document.getElementById("bullet-btn");
const checkboxBtn = document.getElementById("checkbox-btn");
const pomodoroBtn = document.getElementById("pomodoro-btn");
const pomodoroPanel = document.getElementById("pomodoro-panel");
const pomoDisplay = document.getElementById("pomo-display");
const pomoStart = document.getElementById("pomo-start");
const pomoReset = document.getElementById("pomo-reset");
const pomoLabel = document.getElementById("pomo-label");

let panelLockedOpen = false;

function openPanel() {
  toolsPanel.classList.add("open");
  toolsToggle.classList.add("open");
}

function closePanel() {
  if (panelLockedOpen) return;
  toolsPanel.classList.remove("open");
  toolsToggle.classList.remove("open");
  pomodoroPanel.classList.remove("open");
  pomodoroBtn.classList.remove("active");
}

toolsToggle.addEventListener("click", () => {
  panelLockedOpen = !panelLockedOpen;
  if (panelLockedOpen) {
    openPanel();
  } else {
    panelLockedOpen = false;
    closePanel();
  }
});

const toolsSidebar = document.getElementById("tools-sidebar");
toolsSidebar.addEventListener("mouseenter", () => openPanel());
toolsSidebar.addEventListener("mouseleave", () => closePanel());

// Bullet list — inserts a bullet point at cursor
bulletBtn.addEventListener("click", () => {
  contentEl.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const bullet = document.createTextNode("• ");
  range.insertNode(bullet);
  range.setStartAfter(bullet);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});

// Checkbox — inserts a checkbox at cursor
checkboxBtn.addEventListener("click", () => {
  contentEl.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const checkbox = document.createTextNode("☐ ");
  range.insertNode(checkbox);
  range.setStartAfter(checkbox);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});

// Click on ☐ in content to toggle to ☑
contentEl.addEventListener("click", (e) => {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    const offset = range.startOffset;
    const text = node.textContent;
    const charBefore = text[offset - 1];
    const charAt = text[offset];
    const target = charBefore === "☐" ? offset - 1 : charAt === "☐" ? offset : -1;
    if (target >= 0) {
      node.textContent = text.slice(0, target) + "☑" + text.slice(target + 1);
      contentEl.dispatchEvent(new Event("input"));
    } else if (charBefore === "☑" || charAt === "☑") {
      const t2 = charBefore === "☑" ? offset - 1 : offset;
      node.textContent = text.slice(0, t2) + "☐" + text.slice(t2 + 1);
      contentEl.dispatchEvent(new Event("input"));
    }
  }
});

// ── Pomodoro ──
let pomoMinutes = 25;
let pomoSeconds = pomoMinutes * 60;
let pomoInterval = null;
let pomoIsBreak = false;

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.2);
}

function pomoTick() {
  pomoSeconds--;
  if (pomoSeconds <= 0) {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoStart.textContent = "▶";
    playBeep();
    if (!pomoIsBreak) {
      pomoSeconds = 5 * 60;
      pomoIsBreak = true;
      pomoLabel.textContent = "Break!";
      pomoInterval = setInterval(pomoTick, 1000);
      pomoStart.textContent = "⏸";
    } else {
      pomoSeconds = pomoMinutes * 60;
      pomoIsBreak = false;
      pomoLabel.textContent = "Focus";
    }
  }
  const m = String(Math.floor(pomoSeconds / 60)).padStart(2, "0");
  const s = String(pomoSeconds % 60).padStart(2, "0");
  pomoDisplay.textContent = `${m}:${s}`;
}

pomodoroBtn.addEventListener("click", () => {
  const isOpen = pomodoroPanel.classList.toggle("open");
  pomodoroBtn.classList.toggle("active", isOpen);
});

pomoStart.addEventListener("click", () => {
  if (pomoInterval) {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoStart.textContent = "▶";
  } else {
    pomoInterval = setInterval(pomoTick, 1000);
    pomoStart.textContent = "⏸";
  }
});

pomoReset.addEventListener("click", () => {
  clearInterval(pomoInterval);
  pomoInterval = null;
  pomoIsBreak = false;
  pomoSeconds = pomoMinutes * 60;
  const m = String(pomoMinutes).padStart(2, "0");
  pomoDisplay.textContent = `${m}:00`;
  pomoLabel.textContent = "Focus";
  pomoStart.textContent = "▶";
});

pomoDisplay.addEventListener("click", () => {
  if (pomoInterval) return;
  pomoDisplay.contentEditable = "true";
  pomoDisplay.focus();
  const range = document.createRange();
  range.selectNodeContents(pomoDisplay);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
});

pomoDisplay.addEventListener("blur", () => {
  pomoDisplay.contentEditable = "false";
  const text = pomoDisplay.textContent.trim();
  const parts = text.split(":");
  let parsed = parseInt(parts[0]);
  if (!isNaN(parsed) && parsed > 0 && parsed <= 120) {
    pomoMinutes = parsed;
    pomoSeconds = pomoMinutes * 60;
    const m = String(pomoMinutes).padStart(2, "0");
    pomoDisplay.textContent = `${m}:00`;
  } else {
    const m = String(pomoMinutes).padStart(2, "0");
    pomoDisplay.textContent = `${m}:00`;
  }
});

pomoDisplay.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    pomoDisplay.blur();
  }
});

// ── Text Formatting ──
const boldBtn = document.getElementById("bold-btn");
const italicBtn = document.getElementById("italic-btn");
const underlineBtn = document.getElementById("underline-btn");
const highlightBtn = document.getElementById("highlight-btn");
const clearBtn = document.getElementById("clear-btn");

boldBtn.addEventListener("click", () => {
  contentEl.focus();
  document.execCommand("bold");
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});

italicBtn.addEventListener("click", () => {
  contentEl.focus();
  document.execCommand("italic");
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});

underlineBtn.addEventListener("click", () => {
  contentEl.focus();
  document.execCommand("underline");
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});

highlightBtn.addEventListener("click", () => {
  contentEl.focus();
  document.execCommand("hiliteColor", false, "#fff176");
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});

clearBtn.addEventListener("click", () => {
  contentEl.focus();
  document.execCommand("removeFormat");
  contentEl.dispatchEvent(new Event("input"));
  panelLockedOpen = false;
  closePanel();
});
// ── Resize Handle ──
const resizeHandle = document.getElementById("resize-handle");

resizeHandle.addEventListener("mousedown", (e) => {
  e.preventDefault();
  const startX = e.screenX;
  const startY = e.screenY;
  const startW = window.innerWidth;
  const startH = window.innerHeight;

  function onMouseMove(e) {
    const newW = Math.max(200, startW + (e.screenX - startX));
    const newH = Math.max(120, startH + (e.screenY - startY));
    window.resizeTo(newW, newH);
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (window.winStickies) {
      window.winStickies.updateNote(noteId, {
        size: { width: window.innerWidth, height: window.innerHeight }
      });
    }
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});
