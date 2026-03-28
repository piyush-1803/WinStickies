const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('noteId');

let currentNote = null;
let saveTimeout = null;

const container = document.getElementById("note-container");
const contentEl = document.getElementById("content");
const closeBtn = document.getElementById("close-btn");
const collapseBtn = document.getElementById("collapse-btn");
const newBtn = document.getElementById("new-btn");
const floatBtn = document.getElementById("float-btn");
const translucentBtn = document.getElementById("translucent-btn");
const colorDots = document.querySelectorAll(".color-dot");

function updateUI(note) {
  currentNote = note;
  
  // Set content only if it's the first load to prevent cursor jumps
  if (contentEl.innerText === "" && document.activeElement !== contentEl) {
    // Preserve basic line breaks
    contentEl.innerText = note.content || "";
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
    window.winStickies.updateNote(noteId, { content: contentEl.innerText });
  }, 1000);
});

// Actions
closeBtn.addEventListener("click", async () => {
  if (window.winStickies) {
    if (saveTimeout) clearTimeout(saveTimeout);
    await window.winStickies.updateNote(noteId, { content: contentEl.innerText });
    window.winStickies.closeNote(noteId);
  }
});

collapseBtn.addEventListener("click", async () => {
  if (!currentNote || !window.winStickies) return;
  const isCollapsed = !currentNote.isCollapsed;
  currentNote.isCollapsed = isCollapsed;
  container.classList.toggle("collapsed", isCollapsed);
  await window.winStickies.updateNote(noteId, { isCollapsed });
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
