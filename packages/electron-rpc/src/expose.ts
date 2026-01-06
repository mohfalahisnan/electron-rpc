import { contextBridge, ipcRenderer } from "electron"

export function exposeRpc() {
    contextBridge.exposeInMainWorld("ipc", {
        invoke: (channel: string, payload: any) =>
            ipcRenderer.invoke(channel, payload),
    })
}
