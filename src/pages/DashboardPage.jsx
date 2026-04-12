import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

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
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="customer-dashboard-page">
      <div className="customer-dashboard-card">
        <p className="customer-dashboard-overline">TrackJobs Customer Panel</p>
        <h1 className="customer-dashboard-title">Customer Dashboard</h1>
        <p className="customer-dashboard-subtitle">This is the customer panel placeholder.</p>

        <div className="customer-dashboard-panel">
          <p><strong>Name:</strong> {customer?.name || '-'}</p>
          <p><strong>Email:</strong> {customer?.email || '-'}</p>
          <p><strong>Status:</strong> {customer?.status || '-'}</p>
        </div>

        <button className="customer-dashboard-button" type="button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default DashboardPage;