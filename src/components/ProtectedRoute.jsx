import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const customer = JSON.parse(localStorage.getItem('customer_profile') || '{}');
  
  // Only redirect to verification if NOT verified
  if (customer.verification_status !== 'verified') {
    return <Navigate to="/verification-required" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
