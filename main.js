const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs/promises');
const path = require('path');

app.setName('Marky');
process.title = 'Marky';

let mainWindow = null;
let currentFilePath = null;

function broadcastFileState() {
  if (!mainWindow) return;
  mainWindow.webContents.send('file-state', {
    filePath: currentFilePath,
    displayName: currentFilePath ? path.basename(currentFilePath) : 'Untitled.md',
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#2a384e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  updateTitle();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function updateTitle() {
  if (!mainWindow) return;
  const name = currentFilePath ? path.basename(currentFilePath) : 'Untitled.md';
  mainWindow.setTitle(`Marky — ${name}`);
  if (currentFilePath) {
    mainWindow.setRepresentedFilename(currentFilePath);
  } else {
    mainWindow.setRepresentedFilename('');
  }
  broadcastFileState();
}

async function openFile() {
  if (!mainWindow) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return;
  await loadFile(result.filePaths[0]);
}

async function loadFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    currentFilePath = filePath;
    updateTitle();
    mainWindow.webContents.send('file-loaded', { filePath, content });
    app.addRecentDocument(filePath);
  } catch (err) {
    dialog.showErrorBox('Failed to open file', err.message);
  }
}

async function saveFile() {
  if (!mainWindow) return;
  if (!currentFilePath) {
    return saveFileAs();
  }
  mainWindow.webContents.send('request-content-for-save', { saveAs: false });
}

async function saveFileAs() {
  if (!mainWindow) return;
  mainWindow.webContents.send('request-content-for-save', { saveAs: true });
}

async function writeContent({ content, saveAs, suggestedName }) {
  let targetPath = currentFilePath;
  if (saveAs || !targetPath) {
    let defaultPath = targetPath;
    if (!defaultPath) {
      let name = (suggestedName || 'Untitled.md').trim();
      name = name.replace(/[/\\]/g, '');
      if (!/\.(md|markdown|mdown|mkd|txt)$/i.test(name)) name += '.md';
      defaultPath = name;
    }
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    });
    if (result.canceled || !result.filePath) return;
    targetPath = result.filePath;
  }
  try {
    await fs.writeFile(targetPath, content, 'utf-8');
    currentFilePath = targetPath;
    updateTitle();
    mainWindow.webContents.send('file-saved', { filePath: targetPath });
    app.addRecentDocument(targetPath);
  } catch (err) {
    dialog.showErrorBox('Failed to save file', err.message);
  }
}

function newFile() {
  if (!mainWindow) return;
  currentFilePath = null;
  updateTitle();
  mainWindow.webContents.send('file-new');
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: newFile },
        { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: openFile },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: saveFile },
        { label: 'Save As…', accelerator: 'Shift+CmdOrCtrl+S', click: saveFileAs },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Editor Only',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow?.webContents.send('set-view', 'editor'),
        },
        {
          label: 'Split',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow?.webContents.send('set-view', 'split'),
        },
        {
          label: 'Preview Only',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow?.webContents.send('set-view', 'preview'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Slides',
      submenu: [
        {
          label: 'Present',
          accelerator: 'CmdOrCtrl+Return',
          click: () => mainWindow?.webContents.send('open-present'),
        },
        { type: 'separator' },
        {
          label: 'Insert Default Slide',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => mainWindow?.webContents.send('insert-slide', 'default'),
        },
        {
          label: 'Insert Slide With Layout',
          submenu: [
            { label: 'Title', click: () => mainWindow?.webContents.send('insert-slide', 'title') },
            { label: 'Section divider', click: () => mainWindow?.webContents.send('insert-slide', 'section') },
            { label: 'Bullets', click: () => mainWindow?.webContents.send('insert-slide', 'bullets') },
            { label: 'Quote', click: () => mainWindow?.webContents.send('insert-slide', 'quote') },
            { label: 'Image', click: () => mainWindow?.webContents.send('insert-slide', 'image') },
            { label: 'Code', click: () => mainWindow?.webContents.send('insert-slide', 'code') },
            { label: 'Closing', click: () => mainWindow?.webContents.send('insert-slide', 'closing') },
          ],
        },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Markdown Guide',
          accelerator: 'CmdOrCtrl+/',
          click: () => mainWindow?.webContents.send('open-guide'),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('open-file', async (event, filePath) => {
  event.preventDefault();
  if (!mainWindow) {
    app.whenReady().then(() => loadFile(filePath));
  } else {
    await loadFile(filePath);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-content', async (_event, payload) => {
  await writeContent(payload);
});

ipcMain.handle('mark-dirty', (_event, isDirty) => {
  if (mainWindow) mainWindow.setDocumentEdited(isDirty);
});

ipcMain.handle('rename-file', async (_event, newName) => {
  const trimmed = (newName || '').trim();
  if (!trimmed) return { ok: false, error: 'Filename cannot be empty.' };
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    return { ok: false, error: 'Filename cannot contain slashes.' };
  }
  if (!currentFilePath) {
    return { ok: true, displayName: trimmed, filePath: null };
  }
  const dir = path.dirname(currentFilePath);
  const target = path.join(dir, trimmed);
  if (target === currentFilePath) {
    return { ok: true, displayName: trimmed, filePath: currentFilePath };
  }
  try {
    const exists = await fs.access(target).then(() => true).catch(() => false);
    if (exists) return { ok: false, error: 'A file with that name already exists.' };
    await fs.rename(currentFilePath, target);
    currentFilePath = target;
    updateTitle();
    app.addRecentDocument(target);
    return { ok: true, displayName: path.basename(target), filePath: target };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('request-file-state', () => ({
  filePath: currentFilePath,
  displayName: currentFilePath ? path.basename(currentFilePath) : 'Untitled.md',
}));

ipcMain.handle('read-changelog', async () => {
  try {
    return await fs.readFile(path.join(__dirname, 'CHANGELOG.md'), 'utf-8');
  } catch {
    return '';
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());
