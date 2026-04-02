const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("winStickies", {
  getNoteById: (noteId) => ipcRenderer.invoke("notes:getById", noteId),
  updateNote: (noteId, patch) => ipcRenderer.invoke("notes:update", noteId, patch),
  createNote: () => ipcRenderer.invoke("notes:create"),
  closeNote: (noteId) => ipcRenderer.invoke("notes:close", noteId),
  deleteNote: (noteId) => ipcRenderer.invoke("notes:delete", noteId)
});
