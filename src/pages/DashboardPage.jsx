import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  const customer = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('customer_profile') || '{}');
    } catch {
      return {};
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_profile');
    navigate('/login', { replace: true });
  };

  return (
    <div className="page-shell">
      <div className="dashboard-card">
        <h1>Customer Dashboard</h1>
        <p>This is the customer panel placeholder.</p>

        <div className="profile-box">
          <p><strong>Name:</strong> {customer?.name || '-'}</p>
          <p><strong>Email:</strong> {customer?.email || '-'}</p>
          <p><strong>Status:</strong> {customer?.status || '-'}</p>
        </div>

        <button type="button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default DashboardPage;