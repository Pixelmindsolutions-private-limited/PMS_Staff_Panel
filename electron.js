const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let fallbackServer = null;
let isCompact = false;
let keyboardActivityHook = null;

function focusWidgetWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function storeAndBroadcastAuth(payload) {
  if (!payload?.token || !payload?.user) return;
  try {
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'persisted_auth.json'),
      JSON.stringify(payload, null, 2)
    );
  } catch (error) {
    console.warn('Could not persist synced staff login:', error.message);
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('auth-sync', payload);
    focusWidgetWindow();
  }
}

function handleWidgetProtocol(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'pms-widget:') return;
    if (url.hostname === 'sync') {
      const syncId = url.pathname.replace(/^\/+/, '');
      if (!/^[a-f0-9]{48}$/.test(syncId)) return;
      const request = http.get(`https://pmsbackend.pixelmindsolutions.com/login-sync/pending/${syncId}`, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => { body += chunk; });
        response.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (response.statusCode === 200 && result.success) {
              storeAndBroadcastAuth(result.data);
            }
          } catch (error) {
            console.warn('Could not read staff login sync response:', error.message);
          }
        });
      });
      request.setTimeout(5000, () => request.destroy(new Error('Login sync request timed out')));
      request.on('error', error => console.warn('Desktop staff sync failed:', error.message));
      return;
    }
    focusWidgetWindow();
  } catch (_) {}
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function startFallbackServer() {
  if (fallbackServer) {
    try {
      const addr = fallbackServer.address();
      if (addr && addr.port) return Promise.resolve(addr.port);
    } catch (_) {}
  }

  return new Promise((resolve) => {
    const buildDir = path.join(__dirname, 'build');
    fallbackServer = http.createServer((req, res) => {
      let reqPath;
      try {
        reqPath = decodeURIComponent(new URL(req.url, 'http://31.97.228.17:4477').pathname);
      } catch (_) {
        res.writeHead(400);
        return res.end('Bad request');
      }

      // Resolve URL paths from the build directory (strip leading slashes first;
      // path.join can otherwise resolve differently across platforms).
      const relativePath = reqPath.replace(/^\/+/, '');
      let filePath = path.resolve(buildDir, relativePath);
      const buildRoot = path.resolve(buildDir) + path.sep;

      if (!filePath.startsWith(buildRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(buildDir, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    fallbackServer.on('error', (err) => {
      console.warn('Fallback server error:', err.message);
      // Try ephemeral random port
      try {
        const srv = http.createServer((req, res) => {
          let reqPath = req.url.split('?')[0];
          let filePath = path.join(buildDir, reqPath);
          if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            filePath = path.join(buildDir, 'index.html');
          }
          const ext = path.extname(filePath);
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          fs.readFile(filePath, (_, content) => {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
          });
        });
        srv.listen(0, () => {
          resolve(srv.address().port);
        });
      } catch (_) {
        resolve(3000);
      }
    });

    // Listen on dynamic port 0 (OS allocates free port, NO EADDRINUSE conflict ever!)
    fallbackServer.listen(0, () => {
      const assignedPort = fallbackServer.address().port;
      resolve(assignedPort);
    });
  });
}

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const windowWidth = 660;
  const windowHeight = 385;
  const x = Math.max(10, screenWidth - windowWidth - 25);
  const y = 25;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    alwaysOnTop: true, // Floats directly on desktop wallpaper
    resizable: false, // Prevents stretching
    maximizable: false, // Disables maximize to full screen
    closable: false, // Disables closing the window so employees cannot close it
    frame: false, // Frameless floating card
    transparent: true, // Wallpaper visible around the card
    hasShadow: true,
    show: true,
    title: 'PMS Staff - Attendance & Work Tracker',
    icon: path.join(__dirname, 'pms_logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Block any attempt to close the window (Alt+F4, Taskbar thumbnail close, etc.)
  mainWindow.on('close', (event) => {
    event.preventDefault();
  });

  const buildIndex = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(buildIndex)) {
    try {
      const port = await startFallbackServer();
      await mainWindow.loadURL(`http://31.97.228.17:4477/punch-widget`);
    } catch (e) {
      console.error('Fallback server error:', e);
      mainWindow.loadURL('http://31.97.228.17:4477/punch-widget').catch(() => {});
    }
  } else {
    mainWindow.loadURL('http://31.97.228.17:4477/punch-widget').catch(async () => {
      try {
        const port = await startFallbackServer();
        mainWindow.loadURL(`http://31.97.228.17:4477/punch-widget`);
      } catch (e) {
        console.error('Fallback server error:', e);
      }
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock: prevent duplicate instances conflicting
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    const protocolUrl = commandLine.find(value => value.startsWith('pms-widget://'));
    if (protocolUrl) handleWidgetProtocol(protocolUrl);
    else focusWidgetWindow();
  });
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleWidgetProtocol(url);
  });

  // IPC Handlers for window controls
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('get-persisted-auth', () => {
    try {
      const p = path.join(app.getPath('userData'), 'persisted_auth.json');
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (_) {}
    return null;
  });

  ipcMain.on('window-set-height', (event, height) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setSize(660, height);
    }
  });

  ipcMain.on('window-toggle-size', () => {
    if (mainWindow) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth } = primaryDisplay.workAreaSize;
      if (!isCompact) {
        mainWindow.setSize(660, 75);
        mainWindow.setPosition(screenWidth - 685, 25);
        isCompact = true;
      } else {
        mainWindow.setSize(660, 385);
        mainWindow.setPosition(screenWidth - 685, 25);
        isCompact = false;
      }
    }
  });

  ipcMain.on('window-close', () => {
    // Disabled: no employee is permitted to close the widget
  });

  app.whenReady().then(() => {
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.pixelmind.pmsstaff');
    }

    try {
      if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient('pms-widget', process.execPath, [path.resolve(process.argv[1])]);
        }
      } else {
        app.setAsDefaultProtocolClient('pms-widget');
      }
    } catch (_) {}

    try {
      const { uIOhook } = require('uiohook-napi');
      keyboardActivityHook = uIOhook;
      const sendActivity = () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('global-keyboard-activity');
        }
      };
      let lastMouseSend = 0;
      const sendMouseActivity = () => {
        const now = Date.now();
        if (now - lastMouseSend < 400) return;
        lastMouseSend = now;
        sendActivity();
      };
      uIOhook.on('keydown', sendActivity);
      uIOhook.on('mousemove', sendMouseActivity);
      uIOhook.on('mousedown', sendActivity);
      uIOhook.on('mouseup', sendActivity);
      uIOhook.on('wheel', sendMouseActivity);
      uIOhook.start();
      
    } catch (err) {
      console.warn('Global keyboard activity tracking unavailable:', err.message);
    }
    createWindow();
    const startupProtocolUrl = process.argv.find(value => value.startsWith('pms-widget://'));
    if (startupProtocolUrl) setTimeout(() => handleWidgetProtocol(startupProtocolUrl), 500);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('will-quit', () => {
  if (keyboardActivityHook) {
    try { keyboardActivityHook.stop(); } catch (_) {}
  }
});

app.on('window-all-closed', () => {
  if (fallbackServer) {
    try { fallbackServer.close(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
