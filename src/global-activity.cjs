const { uIOhook } = require("uiohook-napi");
const { BrowserWindow } = require("electron");

let isStarted = false;
let lastMouseEventTime = 0;
let lastKeyboardEventTime = 0;

function sendActivity(channel) {
  const windows = BrowserWindow.getAllWindows();

  windows.forEach((win) => {
    if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
      win.webContents.send(channel, {
        timestamp: Date.now(),
      });
    }
  });
}

function startGlobalActivityMonitor() {
  if (isStarted) {
    console.log("Global activity monitor already started");
    return;
  }

  isStarted = true;

  // Global keyboard activity
  uIOhook.on("keydown", () => {
    const now = Date.now();

    // Prevent repeated events from flooding the renderer
    if (now - lastKeyboardEventTime < 300) return;
    lastKeyboardEventTime = now;

    console.log("Global keyboard activity detected");
    sendActivity("global-keyboard-activity");
  });

  // Global mouse movement
  uIOhook.on("mousemove", () => {
    const now = Date.now();

    if (now - lastMouseEventTime < 1000) return;
    lastMouseEventTime = now;

    sendActivity("global-mouse-activity");
  });

  // Global mouse clicks
  uIOhook.on("mousedown", () => {
    sendActivity("global-mouse-activity");
  });

  // Global mouse wheel
  uIOhook.on("wheel", () => {
    sendActivity("global-mouse-activity");
  });

  try {
    uIOhook.start();
    console.log("Global keyboard and mouse monitor started");
  } catch (error) {
    isStarted = false;
    console.error("Unable to start global activity monitor:", error);
  }
}

module.exports = {
  startGlobalActivityMonitor,
};