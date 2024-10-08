import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import DB from '../DRIVERDB/DB'
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    show: false,
    resizable: false,
    contextIsolation: false,

    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.setMenu(null)
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  mainWindow.webContents.openDevTools()
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
ipcMain.handle('dbconnect', async (event, args) => {
  console.log('Function called from React with args:', args)

  if (args.username == '' || args.password == '' || args.url == '') {
    return 400
  }
  const db = new DB()
  //'127.0.0.1:51111'
  return await db.Connect(args.username, args.password, args.url)
})
ipcMain.handle('createdb', async (event, args) => {
  console.log('Function called from React with args:')
  if (args.name == '') {
    return 400
  }
  const db = new DB()
  const l = await db.createDatabase(args.name)

  //'127.0.0.1:51111'
  return l
})

ipcMain.handle('dbdisconnect', async (event, args) => {
  console.log('Function called from React with args:')

  const db = new DB()
  //'127.0.0.1:51111'
  return await db.Disconnect()
})
ipcMain.handle('getDatabases', async (event, args) => {
  console.log('Function called from React with args:')

  const db = new DB()
  //'127.0.0.1:51111'
  return await db.getDatabases()
})

ipcMain.handle('deletedb', async (event, args) => {
  console.log('Function called from React with args:')
  if (args.name == '') {
    return 400
  }
  const db = new DB()
  //'127.0.0.1:51111'
  return await db.deleteDatabase(args.name)
})
ipcMain.handle('getcollaction', async (event, args) => {
  console.log('Function called from React with args:')
  if (args.dbname == '') {
    return 400
  }
  const db = new DB()
  //'127.0.0.1:51111'
  return await db.getcollaction(args.dbname)
})
ipcMain.handle('createcollaction', async (event, args) => {
  console.log('Function called from React with args:', args)
  if (args.dbname == '' || args.collection == '') {
    return 400
  }
  const db = new DB()
  //'127.0.0.1:51111'
  return await db.createCOllaction(args.dbname, args.collection)
})
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  try {
    await db.Disconnect()
  } catch (e) {}
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
