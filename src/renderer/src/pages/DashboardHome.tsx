import { Button } from 'antd'
import { Link } from 'react-router'

function DashboardHome() {
  return (
    <div>
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={async () => {
            console.log('List Protected Users', window.api)
            const users = await window.api.user.list()
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
