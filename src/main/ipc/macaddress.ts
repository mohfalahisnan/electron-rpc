import { ipcMain } from 'electron'
import os from 'os'

export function registerMacHandlers(): void {
  ipcMain.handle('mac:get', async () => {
    try {
      const nets = os.networkInterfaces()
      const macs: string[] = []

      for (const name of Object.keys(nets)) {
        const addrs = nets[name] || []
        for (const addr of addrs) {
          if (addr.internal) continue // skip loopback
          if (!addr.mac || addr.mac === '00:00:00:00:00:00') continue // skip invalid
          macs.push(addr.mac.toLowerCase())
        }
      }

      // unikkan
      const uniqueMacs = Array.from(new Set(macs))

      return { success: true, data: uniqueMacs }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to get MAC address' }
    }
  })

  ipcMain.handle('mac:getPrimary', async () => {
    try {
      const nets = os.networkInterfaces()
      for (const name of Object.keys(nets)) {
        const addrs = nets[name] || []
        for (const addr of addrs) {
          if (addr.internal) continue
          if (!addr.mac || addr.mac === '00:00:00:00:00:00') continue
          return { success: true, data: addr.mac.toLowerCase() }
        }
      }
      return { success: false, error: 'No valid MAC address found' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to get MAC address' }
    }
  })
}
