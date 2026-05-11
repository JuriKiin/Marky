const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('marky', {
  onFileLoaded: (callback) =>
    ipcRenderer.on('file-loaded', (_e, data) => callback(data)),
  onFileSaved: (callback) =>
    ipcRenderer.on('file-saved', (_e, data) => callback(data)),
  onFileNew: (callback) => ipcRenderer.on('file-new', () => callback()),
  onFileState: (callback) =>
    ipcRenderer.on('file-state', (_e, data) => callback(data)),
  onRequestSave: (callback) =>
    ipcRenderer.on('request-content-for-save', (_e, data) => callback(data)),
  onSetView: (callback) =>
    ipcRenderer.on('set-view', (_e, view) => callback(view)),
  onOpenGuide: (callback) => ipcRenderer.on('open-guide', () => callback()),
  saveContent: (payload) => ipcRenderer.invoke('save-content', payload),
  markDirty: (isDirty) => ipcRenderer.invoke('mark-dirty', isDirty),
  renameFile: (newName) => ipcRenderer.invoke('rename-file', newName),
  requestFileState: () => ipcRenderer.invoke('request-file-state'),
  readChangelog: () => ipcRenderer.invoke('read-changelog'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
