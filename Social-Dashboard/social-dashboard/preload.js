const { ipcRenderer } = require('electron');

window.electronAPI = {
  reloadSite: (key) => ipcRenderer.send('reload-site', key),
  goHome: (key) => ipcRenderer.send('go-home', key),
  goBack: (key) => ipcRenderer.send('go-back', key),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
};
