import { createProxy } from '@mavolostudio/electron-rpc/client'
import { tanstackProcedures } from '@mavolostudio/electron-rpc/tanstack-procedures'
import type { AppRouter } from '../../main/user.rpc'
import { queryClient } from './query-client'

// Create proxy that uses key-based invocation for registerIpcRouter
const proxy = createProxy<AppRouter>((path, args) => {
  return window.rpc.invoke('rpc', { key: path[0], input: args[0] })
})

// Export direct RPC client
export const rpc = proxy

// Export Tanstack Query wrapped client
export const client = tanstackProcedures(proxy, queryClient)
