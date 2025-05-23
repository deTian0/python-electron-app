import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
    
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.js'),
          robot: resolve(__dirname, 'src/preload/index.js')
        }
      }
    }
  },
  renderer: {
    build: {
    
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          robot: resolve(__dirname, 'src/renderer/robot.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
