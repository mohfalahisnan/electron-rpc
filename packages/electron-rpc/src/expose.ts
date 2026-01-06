import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("ipc", {
    invoke: (channel: string, payload: any) =>
        ipcRenderer.invoke(channel, payload),
})
