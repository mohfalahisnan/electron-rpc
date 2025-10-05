import { Menu } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

const items = [
  {
    label: 'Dashboard',
    key: '/dashboard'
  },
  {
    label: 'Expense',
    children: [
      {
        label: 'Expense',
        key: '/dashboard/expense'
      },
      {
        label: 'Income',
        key: '/dashboard/income'
      }
    ]
  }
]

function Dashboard() {
  const location = useLocation()
  const [current, setCurrent] = useState(
    items.find((item) => item.key === location.pathname)?.key || items[0].key
  )

  const navigate = useNavigate()
  const onClick = (e: any) => {
    navigate(e.key)
    setCurrent(e.key)
  }
  return (
    <div>
      <nav className="sticky top-0 z-50">
        <Menu
          onClick={onClick}
          selectedKeys={[current as string]}
          mode="horizontal"
          items={items as ItemType[]}
        />
      </nav>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  )
}

export default Dashboard
