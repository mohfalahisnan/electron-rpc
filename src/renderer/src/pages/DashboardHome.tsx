import { Button, message } from 'antd'
import { Link } from 'react-router'
const data = {
  expenseHead: [
    { name: 'Food' },
    { name: 'Transport' },
    { name: 'Entertainment' },
    { name: 'Other' }
  ],
  expense: [
    {
      name: 'Food',
      date: '2023-01-01',
      amount: 1000,
      expenseHeadId: 1,
      invoiceNumber: 'INV-001'
    },
    {
      name: 'Transport',
      date: '2023-01-02',
      amount: 500,
      expenseHeadId: 2,
      invoiceNumber: 'INV-002'
    },
    {
      name: 'Entertainment',
      date: '2023-01-03',
      amount: 200,
      expenseHeadId: 3,
      invoiceNumber: 'INV-003'
    },
    {
      name: 'Other',
      date: '2023-01-04',
      amount: 300,
      expenseHeadId: 4,
      invoiceNumber: 'INV-004'
    }
  ]
}
function DashboardHome() {
  const seedExpenseHead = () => {
    for (const head of data.expenseHead) {
      window.api.expenseHead.create(head)
    }
    message.success('Expense Head data seeded successfully')
  }
  const seedExpense = () => {
    for (const expense of data.expense) {
      window.api.expense.create(expense)
    }
    message.success('Expense data seeded successfully')
  }
  return (
    <div>
      <div className="flex justify-center items-center gap-4">
        <Button onClick={seedExpenseHead}>Seed Expense Head Data</Button>
        <Button onClick={seedExpense}>Seed Expense Data</Button>
      </div>
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={async () => {
            console.log('List Protected Users', window.protected)
            const users = await window.protected.query.user.list('asd')
            console.log(users)
          }}
        >
          List Protected Users
        </Button>
      </div>
      DashboardHome <br /> <Link to="/">back to Login</Link>
    </div>
  )
}

export default DashboardHome
