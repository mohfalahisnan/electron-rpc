import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { buildApiFromTree } from './api'
import fs from 'fs'
import path from 'path'

let tree: any = {}
try {
  const file = path.resolve(__dirname, './ipc-channels.json')
  const content = fs.readFileSync(file, 'utf-8')
  tree = JSON.parse(content)
} catch (error) {
  console.warn('[preload] ipc-channels.json not found or invalid; api will be empty')
}

const api = buildApiFromTree(tree)

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
