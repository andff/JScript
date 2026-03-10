const { ipcRenderer } = require('electron');

window.electronAPI = {
  launchDashboard: (config)  => ipcRenderer.send('launch-dashboard', config),
  goToSetup:       ()        => ipcRenderer.send('go-to-setup'),
  reloadSite:      (idx)     => ipcRenderer.send('reload-site', idx),
  goHome:          (idx)     => ipcRenderer.send('go-home', idx),
  minimize:        ()        => ipcRenderer.send('window-minimize'),
  maximize:        ()        => ipcRenderer.send('window-maximize'),
  close:           ()        => ipcRenderer.send('window-close'),
};
