const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  toggleSize: () => ipcRenderer.send('window-toggle-size'),
  setHeight: (height) => ipcRenderer.send('window-set-height', height),
  onAuthSync: (callback) => ipcRenderer.on('auth-sync', (_event, value) => callback(value)),
  onGlobalKeyboardActivity: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('global-keyboard-activity', listener);
    return () => ipcRenderer.removeListener('global-keyboard-activity', listener);
  },
  onGlobalMouseActivity: (callback) => {
  const listener = () => callback();
  ipcRenderer.on('global-mouse-activity', listener);

  return () => {
    ipcRenderer.removeListener('global-mouse-activity', listener);
  };
},
  getPersistedAuth: () => ipcRenderer.invoke('get-persisted-auth')
});
