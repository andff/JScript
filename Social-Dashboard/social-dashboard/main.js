const { app, BrowserWindow, BrowserView, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let views = {};

const SITES = {
  twitter:   { url: 'https://x.com',           label: 'X (Twitter)', color: '#000000', icon: '𝕏' },
  facebook:  { url: 'https://facebook.com',     label: 'Facebook',    color: '#1877F2', icon: '𝑓' },
  instagram: { url: 'https://instagram.com',    label: 'Instagram',   color: '#E1306C', icon: '📷' },
  reddit:    { url: 'https://reddit.com',       label: 'Reddit',      color: '#FF4500', icon: '🤖' },
};

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.maximize();
  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => createViews(), 300);
  });
}

function createViews() {
  const HEADER_HEIGHT = 52;
  const BORDER = 2;
  const { width, height } = mainWindow.getBounds();

  const halfW = Math.floor((width - BORDER) / 2);
  const halfH = Math.floor((height - HEADER_HEIGHT - BORDER) / 2);

  const positions = [
    { key: 'twitter',   x: 0,             y: HEADER_HEIGHT,            w: halfW, h: halfH },
    { key: 'facebook',  x: halfW + BORDER, y: HEADER_HEIGHT,            w: halfW, h: halfH },
    { key: 'instagram', x: 0,             y: HEADER_HEIGHT + halfH + BORDER, w: halfW, h: halfH },
    { key: 'reddit',    x: halfW + BORDER, y: HEADER_HEIGHT + halfH + BORDER, w: halfW, h: halfH },
  ];

  for (const pos of positions) {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: `persist:${pos.key}`,
      },
    });

    mainWindow.addBrowserView(view);
    view.setBounds({ x: pos.x, y: pos.y, width: pos.w, height: pos.h });
    view.setAutoResize({ width: false, height: false });
    view.webContents.loadURL(SITES[pos.key].url);

    views[pos.key] = { view, ...pos };
  }
}

function repositionViews() {
  if (!mainWindow || Object.keys(views).length === 0) return;

  const HEADER_HEIGHT = 52;
  const BORDER = 2;
  const { width, height } = mainWindow.getBounds();

  const halfW = Math.floor((width - BORDER) / 2);
  const halfH = Math.floor((height - HEADER_HEIGHT - BORDER) / 2);

  const positions = {
    twitter:   { x: 0,             y: HEADER_HEIGHT,                    w: halfW, h: halfH },
    facebook:  { x: halfW + BORDER, y: HEADER_HEIGHT,                   w: halfW, h: halfH },
    instagram: { x: 0,             y: HEADER_HEIGHT + halfH + BORDER,   w: halfW, h: halfH },
    reddit:    { x: halfW + BORDER, y: HEADER_HEIGHT + halfH + BORDER,  w: halfW, h: halfH },
  };

  for (const [key, data] of Object.entries(views)) {
    const p = positions[key];
    data.view.setBounds({ x: p.x, y: p.y, width: p.w, height: p.h });
  }
}

// IPC handlers
ipcMain.on('reload-site', (_, key) => {
  if (views[key]) views[key].view.webContents.reload();
});

ipcMain.on('go-home', (_, key) => {
  if (views[key]) views[key].view.webContents.loadURL(SITES[key].url);
});

ipcMain.on('go-back', (_, key) => {
  if (views[key] && views[key].view.webContents.canGoBack()) {
    views[key].view.webContents.goBack();
  }
});

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => app.quit());

mainWindow && mainWindow.on('resize', repositionViews);

app.whenReady().then(() => {
  createWindow();
  mainWindow.on('resize', repositionViews);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
