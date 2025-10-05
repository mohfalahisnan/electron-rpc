import { DataTypes } from 'sequelize'
import { sequelize } from '../database'

export const ExpenseAttachment = sequelize.define('ExpenseAttachment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUID, primaryKey: true },
  expenseId: { type: DataTypes.UUID, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  filename: { type: DataTypes.STRING },
  mimeType: { type: DataTypes.STRING },
  size: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})
