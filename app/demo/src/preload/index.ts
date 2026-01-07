import { electronAPI } from '@electron-toolkit/preload'
import { exposeRpc } from '@mavolostudio/electron-rpc/expose'
import { contextBridge } from 'electron'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    exposeRpc({ name: 'rpc', whitelist: ['rpc'] })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
