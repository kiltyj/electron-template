import {spawn} from 'child_process';
import {enableLiveReload} from 'electron-compile';
import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';
import url from 'url';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import fs from 'fs';
import isDev from 'electron-is-dev';

const cwd = path.resolve(__dirname);
let quitting = false;
let backendProcess = spawn('java', ['-jar', cwd + '/../resources/backend.jar']);
backendProcess.on('exit', (code, signal) => {
  console.log('Backend process exited: ' + JSON.stringify({code, signal}));
  backendProcess = null;
  if (!quitting) {
    process.exit(1);
  }
});

let backendPort;
let resolveBackendStarted;
const backendStartedPromise = new Promise((resolve) => {
  resolveBackendStarted = resolve;
});

backendProcess.stdout.on('data', async (chunk) => {
  const line = chunk.toString();
  console.log(line);
  if (line.startsWith("BACKEND_PORT:")) {
    backendPort = parseInt(line.split(':')[1].trim());
    resolveBackendStarted();
  }
});

backendProcess.stderr.on('data', async (chunk) => {
  const line = chunk.toString();
  console.error(line);
});

const waitForBackend = async () => {
  await backendStartedPromise;
  console.log('Backend service started on port ' + backendPort);
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = async () => {
  const enableDevTools = process.env.DEV || isDev;
  let loadingScreen = null;

  const loadingScreenPath = path.join(__dirname, 'loading.html');
  if (fs.existsSync(loadingScreenPath)) {
    loadingScreen = new BrowserWindow({width: 200, height: 200, frame: false, transparent: true, show: false});
    loadingScreen.loadURL(url.format({
      pathname: loadingScreenPath,
      protocol: 'file:',
      slashes: true
    }));
    loadingScreen.once('ready-to-show', () => {
      loadingScreen.show()
    });
  }

  if (enableDevTools) {
    enableLiveReload({strategy: 'react-hmr'});
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, show: false});

  await waitForBackend();

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  ipcMain.once('ready-to-show', () => {
    if (loadingScreen != null) {
      loadingScreen.close();
    }
    mainWindow.show()
  });

  if (enableDevTools) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

app.on('quit', () => {
  quitting = true;
  if (backendProcess != null) {
    backendProcess.kill();
  }
});

ipcMain.on('resize', (event, {w, h, animate, lock}) => {
  mainWindow.setSize(w, h, animate);
  mainWindow.setResizable(!lock);
  mainWindow.setFullScreenable(!lock);
});

ipcMain.on('close', (event) => {
  mainWindow.close();
});

ipcMain.on('toggle-dev-tools', () => {
  mainWindow.toggleDevTools();
});

ipcMain.on('get-backend-port', (event) => {
  event.returnValue = backendPort;
});
