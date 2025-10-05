import { DataTypes } from 'sequelize'
import { sequelize } from '../database'

export const Income = sequelize.define(
  'Income',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUID, primaryKey: true },
    incomeHeadId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    invoiceNumber: { type: DataTypes.STRING(100) },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    indexes: [{ fields: ['date'] }, { fields: ['invoiceNumber'] }]
  }
)
