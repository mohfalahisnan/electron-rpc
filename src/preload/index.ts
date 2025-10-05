import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { protectedApi } from './api'

// Custom APIs for renderer
const api = {
  user: {
    list: () => ipcRenderer.invoke('user:list'),
    create: (data: { username: string; password: string }) =>
      ipcRenderer.invoke('user:create', data)
  },
  income: {
    list: () => ipcRenderer.invoke('income:list'),
    create: (data: any) => ipcRenderer.invoke('income:create', data),
    delete: (id: number) => ipcRenderer.invoke('income:delete', id)
  },
  expense: {
    list: () => ipcRenderer.invoke('expense:list'),
    create: (data: any) => ipcRenderer.invoke('expense:create', data),
    delete: (id: number) => ipcRenderer.invoke('expense:delete', id)
  },
  expenseHead: {
    list: () => ipcRenderer.invoke('expenseHead:list'),
    create: (data: { name: string }) => ipcRenderer.invoke('expenseHead:create', data)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('protected', protectedApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
