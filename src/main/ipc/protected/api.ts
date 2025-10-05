import { ipcMain } from 'electron'
import { User } from '../../models/user'
import { applyMiddlewares, withAuth, withToken } from './middleware'

type ListUsersArgs = { sessionId: string }
type ListUsersResult = { id: number; name: string }[]

export const registerProtectedApi = () => {
  ipcMain.handle(
    'protected:user:list',
    applyMiddlewares<ListUsersArgs, ListUsersResult>(
      withToken(),
      withAuth()
    )(async (_event, _args) => {
      const users = await User.findAll({ raw: true })
      return users as unknown as ListUsersResult
    })
  )
}
