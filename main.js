const { app, BrowserWindow } = require('electron');
const colors = require('ansi-colors');

let mainWindow;

let frame = 0;
const headless = false;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    transparent: true,
    resizable: false,
    show: !headless,
    webPreferences: {
      offscreen: headless,
      nodeIntegration: true,
      contextIsolation: false
    },
  });
  
  mainWindow.loadFile('frontend/index.html');

  mainWindow.on("ready-to-show", () => {
    mainWindow.webContents.openDevTools();
  });

  // Ensure some rendering
  // mainWindow.webContents.setFrameRate(30);
});

app.on('window-all-closed', () => {
  client.close();
  app.quit()
});