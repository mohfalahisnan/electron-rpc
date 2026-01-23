import { registerIpcRouter } from '@mavolostudio/electron-rpc'
import { createContext } from './context'
import { loggingPlugin, metricsPlugin } from './plugins'
import { userHandlers, userRouter } from './user.rpc'

registerIpcRouter('rpc', userRouter, userHandlers, createContext, [loggingPlugin, metricsPlugin])
