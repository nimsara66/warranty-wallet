import { Navigate,Outlet } from 'react-router-dom'
import { useAppContext } from '../context/appContext'

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext()

  // console.log(user)
  if (!user) {
    return <Navigate to='/login' />
  }
 
  // return children
  return  <Outlet />
}

export default ProtectedRoute