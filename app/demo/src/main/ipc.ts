import { registerIpcRouter } from '@mavolostudio/electron-rpc'
import { createContext } from './context'
import { loggingPlugin, metricsPlugin } from './plugins'
import { userRouter } from './user.rpc'

registerIpcRouter('rpc', userRouter, createContext, [loggingPlugin, metricsPlugin])
