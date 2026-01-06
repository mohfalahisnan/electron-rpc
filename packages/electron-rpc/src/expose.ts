import { contextBridge, ipcRenderer } from "electron"

export type ExposeConfig = {
    name?: string
    whitelist?: string[]
}

export function exposeRpc(config: ExposeConfig = {}) {
    const { name = "ipc", whitelist } = config

    contextBridge.exposeInMainWorld(name, {
        invoke: (channel: string, payload: any) => {
            if (whitelist && !whitelist.includes(channel)) {
                return Promise.reject(new Error(`Channel "${channel}" is not allowed`))
            }
            return ipcRenderer.invoke(channel, payload)
        },
    })
}
