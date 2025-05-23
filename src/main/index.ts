import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
const path = require('path');
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow
let robotWindow
let pyProc 

function createRobotWindow() {
  // Create the browser window.
  robotWindow = new BrowserWindow({
    width: 300,
    height: 200,
    show: false,
    alwaysOnTop: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      sandbox: false
    }
  })

  robotWindow.loadFile(join(__dirname, '../renderer/robot.html'))
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 启动flask server，通过python-shell 调用python脚本（开发调试阶段）
// function startServer_PY() {
//   var { PythonShell } = require('python-shell')
//   const pythonPath = require('path').resolve(__dirname, '../../py/venv/Scripts/python')
//   const scriptPath = require('path').resolve(__dirname, '../../py/app.py')

//   let options = {
//     mode: 'text',
//     pythonPath: pythonPath
//   }

//   PythonShell.run(scriptPath, options, function (err, results) {
//     if (err) {
//       console.error('Error running Python script:', err)
//       throw err
//     }
//     // results is an array consisting of messages collected during execution
//     console.log('response: ', results)
//   })
// }

// 启动flask server，通过子进程执行已经将python项目打包好的exe文件（打包阶段）
function startServer_EXE() {
  let script = path.join(__dirname,'../../', 'pydist', 'app', 'app.exe')
  console.log(script)
  pyProc = require('child_process').execFile(script)
  if (pyProc != null) {
      console.log('flask server start success')
  }else{
    console.log('flask server start shibai')
  }

}

// 停止flask server 函数
function stopServer() {
  pyProc.kill()
  console.log('kill flask server  success')
  pyProc = null
}

// 监听最小化命令
ipcMain.on('window-min', () => {
  mainWindow.minimize()
  robotWindow.show()
})

// 监听恢复尺寸命令
ipcMain.on('window-restore', () => {
  mainWindow.restore()
  robotWindow.minimize()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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
  // startServer_PY()
  startServer_EXE();
  createWindow()
  createRobotWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
      createRobotWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  stopServer()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
