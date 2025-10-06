import { IpcRouter } from '../ipc/router'

export function registerUserRoutes(router: IpcRouter) {
  router.register('user:list', [], async () => {
    return [{ id: 1, name: 'Alice' }]
  })
}
