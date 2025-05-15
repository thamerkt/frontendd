import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ role }) => {
  const token = Cookies.get('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Navigate to="/login" replace />;

  const userRole = user?.role;

  if (role && userRole !== role) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
