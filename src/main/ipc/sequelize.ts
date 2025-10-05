import { ipcMain } from 'electron'
import { User } from '../models/user'
import { Income } from '../models/income'
import { Expense } from '../models/expense'
import { ExpenseHead } from '../models/expenseHead'

export function registerSequelizeHandler() {
  // User
  ipcMain.handle('user:list', async () => {
    return await User.findAll({ raw: true })
  })

  ipcMain.handle('user:create', async (_e, data) => {
    return await User.create(data)
  })

  // Income
  ipcMain.handle('income:list', async () => {
    return await Income.findAll({ raw: true })
  })

  ipcMain.handle('income:create', async (_e, data) => {
    return await Income.create(data)
  })
  ipcMain.handle('income:delete', async (_e, id) => {
    return await Income.destroy({
      where: {
        id: Number(id)
      }
    })
  })

  // Expense
  ipcMain.handle('expense:list', async () => {
    return await Expense.findAll({ raw: true })
  })

  ipcMain.handle('expense:create', async (_e, data) => {
    return await Expense.create(data)
  })

  ipcMain.handle('expenseHead:list', async () => {
    return await ExpenseHead.findAll({ raw: true })
  })

  ipcMain.handle('expenseHead:create', async (_e, data) => {
    return await ExpenseHead.create(data)
  })

  ipcMain.handle('expense:delete', async (_e, id) => {
    return await Expense.destroy({
      where: {
        id: Number(id)
      }
    })
  })
}
