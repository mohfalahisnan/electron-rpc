import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getMacs: () => any
      getPrimary: () => any
      user: {
        list: () => Promise<any[]>
        create: (data: { username: string; password: string }) => Promise<any>
      }
      income: {
        list: () => Promise<any[]>
        create: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      expense: {
        list: () => Promise<any[]>
        create: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      expenseHead: {
        list: () => Promise<any[]>
        create: (data: { name: string }) => Promise<any>
        delete: (id: number) => Promise<any>
      }
    }
    protected: {
      query: {
        user: {
          list: (sessionId: string) => Promise<any[]>
        }
      }
    }
  }
}
