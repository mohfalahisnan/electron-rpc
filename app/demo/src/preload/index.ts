import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { exposeRpc } from '@mavolostudio/electron-rpc/expose'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    exposeRpc({ whitelist: ['rpc'] })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
