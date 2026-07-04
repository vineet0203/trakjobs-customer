import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('customer_token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const customer = JSON.parse(localStorage.getItem('customer_profile') || '{}');
    return <Navigate to="/verification" replace />;

  return children;
};

export default ProtectedRoute;