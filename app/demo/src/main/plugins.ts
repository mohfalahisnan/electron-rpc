import type { Plugin } from '@mavolostudio/electron-rpc'

/**
 * Logging plugin - logs all RPC requests and responses
 */
export const loggingPlugin: Plugin = {
  name: 'logging',

  onRequest: async ({ key, input }) => {
    console.log(`[Plugin] → ${key}`, input)
  },

  onResponse: async ({ key, output }) => {
    console.log(`[Plugin] ← ${key}`, output)
  },

  onError: async ({ key, error }) => {
    console.error(`[Plugin] ✗ ${key}`, error)
  }
}

/**
 * Metrics plugin - tracks RPC call duration
 */
export const metricsPlugin: Plugin = {
  name: 'metrics',

  onRequest: async ({ key }) => {
    const start = Date.now()
    // Store start time (in real app, use WeakMap or similar)
    ;(globalThis as any).__rpcMetrics = {
      ...(globalThis as any).__rpcMetrics,
      [key]: start
    }
  },

  onResponse: async ({ key }) => {
    const start = (globalThis as any).__rpcMetrics?.[key]
    if (start) {
      const duration = Date.now() - start
      console.log(`[Metrics] ${key} took ${duration}ms`)
    }
  }
}
