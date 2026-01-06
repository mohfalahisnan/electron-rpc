import { Outlet } from 'react-router'

function AppLayout() {
  return (
    <div className="relative min-h-screen">
      <Outlet />
    </div>
  )
}

export default AppLayout
