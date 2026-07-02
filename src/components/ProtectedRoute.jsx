import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('customer_token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const customer = JSON.parse(localStorage.getItem('customer_profile') || '{}');
  if (customer && customer.verification_status !== 'verified') {
    const vendorAppUrl = import.meta.env.VITE_VENDOR_APP_URL || 'http://localhost:5173';
    window.location.href = `${vendorAppUrl}/verification?authToken=${token}&role=Customer`;
    return null;
  }

  return children;
};

export default ProtectedRoute;