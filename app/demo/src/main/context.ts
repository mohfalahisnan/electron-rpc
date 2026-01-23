import type { IpcMainInvokeEvent } from 'electron'

/**
 * Application context available to all RPC procedures
 */
export type AppContext = {
  user: { id: string; role: 'admin' | 'user' }
  db: {
    user: {
      findById(id: string): Promise<{ id: string; email: string }>
    }
  }
}

/**
 * Create context for each RPC request
 */
export async function createContext(_event: IpcMainInvokeEvent): Promise<AppContext> {
  // Access event.sender if needed for more info about the caller
  return {
    user: { id: 'u1', role: 'admin' as const }, // from session
    db: {
      user: {
        async findById(id: string) {
          return { id, email: 'admin@example.com' }
        }
      }
    }
  }
}
