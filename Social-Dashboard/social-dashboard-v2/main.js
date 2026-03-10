const { app, BrowserWindow, BrowserView, ipcMain, screen } = require('electron');
const path = require('path');

let setupWindow = null;
let dashWindow  = null;
let views       = [];
let currentConfig = null;

// ── Setup window ──────────────────────────────────────────────────────────────
function createSetupWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  setupWindow = new BrowserWindow({
    width: Math.min(900, width - 100),
    height: Math.min(700, height - 80),
    center: true,
    frame: false,
    backgroundColor: '#080808',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  setupWindow.loadFile('setup.html');
}

// ── Dashboard window ──────────────────────────────────────────────────────────
function createDashWindow(config) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  currentConfig = config;

  dashWindow = new BrowserWindow({
    width, height, x: 0, y: 0,
    frame: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  dashWindow.maximize();

  // Encode config in hash so dashboard.html can read it
  const encoded = encodeURIComponent(JSON.stringify({ sites: config.sites }));
  dashWindow.loadFile('dashboard.html', { hash: encoded });

  dashWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => createViews(config), 350);
  });

  dashWindow.on('resize', () => repositionViews());
  dashWindow.on('closed', () => { dashWindow = null; destroyViews(); });
}

// ── View layout engine ────────────────────────────────────────────────────────
const HEADER = 50;
const GAP    = 2;

function computeBounds(index, total, layout, winW, winH) {
  const { cols, rows } = layout;
  const availH = winH - HEADER;

  if (rows) {
    // Grid mode (e.g. 2x2, 3x2)
    const actualCols = cols;
    const actualRows = rows;
    const colIdx = index % actualCols;
    const rowIdx = Math.floor(index / actualCols);
    const cellW = Math.floor((winW - GAP * (actualCols - 1)) / actualCols);
    const cellH = Math.floor((availH - GAP * (actualRows - 1)) / actualRows);
    return {
      x: colIdx * (cellW + GAP),
      y: HEADER + rowIdx * (cellH + GAP),
      width:  colIdx === actualCols - 1 ? winW - colIdx * (cellW + GAP) : cellW,
      height: rowIdx === actualRows - 1 ? availH - rowIdx * (cellH + GAP) : cellH,
    };
  } else {
    // Columns mode — each panel is a vertical strip
    const actualCols = Math.min(cols, total);
    const cellW = Math.floor((winW - GAP * (actualCols - 1)) / actualCols);
    const rowsPerCol = Math.ceil(total / actualCols);
    const colIdx = Math.floor(index / rowsPerCol);
    const rowIdx = index % rowsPerCol;
    const cellH = Math.floor((availH - GAP * (rowsPerCol - 1)) / rowsPerCol);
    return {
      x: colIdx * (cellW + GAP),
      y: HEADER + rowIdx * (cellH + GAP),
      width:  colIdx === actualCols - 1 ? winW - colIdx * (cellW + GAP) : cellW,
      height: rowIdx === rowsPerCol - 1 ? availH - rowIdx * (cellH + GAP) : cellH,
    };
  }
}

function createViews(config) {
  if (!dashWindow) return;
  destroyViews();

  const { width, height } = dashWindow.getBounds();

  config.sites.forEach((site, i) => {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: `persist:${site.key || 'custom_' + i}`,
      },
    });

    dashWindow.addBrowserView(view);
    const bounds = computeBounds(i, config.sites.length, config.layout, width, height);
    view.setBounds(bounds);
    view.webContents.loadURL(site.url);
    views.push(view);
  });
}

function repositionViews() {
  if (!dashWindow || views.length === 0 || !currentConfig) return;
  const { width, height } = dashWindow.getBounds();
  views.forEach((view, i) => {
    const bounds = computeBounds(i, views.length, currentConfig.layout, width, height);
    view.setBounds(bounds);
  });
}

function destroyViews() {
  if (dashWindow) {
    views.forEach(v => {
      try { dashWindow.removeBrowserView(v); } catch(_) {}
    });
  }
  views = [];
}

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.on('launch-dashboard', (_, config) => {
  if (setupWindow) { setupWindow.close(); setupWindow = null; }
  createDashWindow(config);
});

ipcMain.on('go-to-setup', () => {
  destroyViews();
  if (dashWindow) { dashWindow.close(); dashWindow = null; }
  createSetupWindow();
});

ipcMain.on('reload-site', (_, idx) => {
  if (views[idx]) views[idx].webContents.reload();
});

ipcMain.on('go-home', (_, idx) => {
  if (views[idx] && currentConfig) {
    views[idx].webContents.loadURL(currentConfig.sites[idx].url);
  }
});

ipcMain.on('window-minimize', () => (dashWindow || setupWindow)?.minimize());
ipcMain.on('window-maximize', () => {
  const w = dashWindow || setupWindow;
  if (w) w.isMaximized() ? w.unmaximize() : w.maximize();
});
ipcMain.on('window-close', () => app.quit());

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(createSetupWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
