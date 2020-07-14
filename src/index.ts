import { app, BrowserWindow } from 'electron'
import { exec } from 'child_process'
import path from 'path'
import Store from './store'
declare const MAIN_WINDOW_WEBPACK_ENTRY: any

const initialWidth = 560
const initialHeight = 315
const aspectRatio = initialHeight / initialWidth

// Create instantiate a store with default values
const store: any = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: initialWidth, height: initialHeight, aspectRatio },
    windowPosition: { x: 100, y: 100 },
    isRegisterDefined: false
  }
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

// Create Windows Register to allow custon protocol open without dialog box
const isRegisterDefined = store.get('isRegisterDefined')
if (process.platform === 'win32' && !isRegisterDefined) {
  const executablePath = path.join(app.getAppPath(), 'src', 'allow-custon-protocol.reg')
  exec(executablePath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }

    store.set('isRegisterDefined', true)
  })
}

// Define protocol
const PROTOCOL_PREFIX = 'aonix-youtube-float'
if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
  app.setAsDefaultProtocolClient(PROTOCOL_PREFIX, process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_PREFIX)
}

const createWindow = () => {
  // Load initial configs
  const { width, height } = store.get('windowBounds')
  const { x, y } = store.get('windowPosition')

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 180,
    minHeight: 101,
    alwaysOnTop: true,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      additionalArguments: [...process.argv]
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('resize', () => {
    let { width: actualWidth } = mainWindow.getBounds()
    const width = Math.ceil(actualWidth)
    const height = Math.ceil(aspectRatio * width)

    mainWindow.setSize(width, height)
    store.set('windowBounds', { width, height })
  })

  mainWindow.on('move', () => {
    let { x, y } = mainWindow.getBounds()
    setTimeout(() => store.set('windowPosition', { x, y }), 500)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
