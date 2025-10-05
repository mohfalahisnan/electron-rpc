import { DataTypes } from 'sequelize'
import { sequelize } from '../database'

export const ExpenseHead = sequelize.define('ExpenseHead', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUID, primaryKey: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  notes: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
})
