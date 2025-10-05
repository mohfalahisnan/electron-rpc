import { ipcRenderer } from 'electron'

export const protectedApi = {
  query: {
    user: {
      list: (sessionId: string) => ipcRenderer.invoke('protected:user:list', { sessionId })
    }
  }
}
