import { createProxy } from '@mavolostudio/electron-rpc/client'
import { tanstackProcedures } from '@mavolostudio/electron-rpc/tanstack-procedures'
import type { AppApi } from '../../main/user.rpc'
import { queryClient } from './query-client'

// Create proxy that uses key-based invocation for registerIpcRouter
const proxy = createProxy<AppApi>((path, args) => {
  const key = path[0] // First path segment is the procedure key
  const input = args[0] // First argument is the input
  return window.rpc.invoke('rpc', { key, input })
})

// Export direct RPC client
export const rpc = proxy

// Export Tanstack Query wrapped client
export const client = tanstackProcedures(proxy, queryClient)
