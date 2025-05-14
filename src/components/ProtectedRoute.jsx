import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ role }) => {
  const user = JSON.parse(localStorage.getItem('user'));  // <-- Parse here

  const userRole = user?.role;  // Safe access
  const isAuthenticated = !!Cookies.get('token');

  console.log('User role:', userRole);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/unauthorized" />;

  return <Outlet />;
};

export default ProtectedRoute;
