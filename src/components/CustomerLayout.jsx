import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', roles: ['customer'], icon: 'dashboard' },
  { path: '/quotes', label: 'Quotes', roles: ['customer'], icon: 'quotes' },
  { path: '/jobs', label: 'Jobs', roles: ['customer'], icon: 'jobs' },
];

const CustomerLayout = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'customer';
  const customer = JSON.parse(localStorage.getItem('customer_profile') || '{}');

  const allowedItems = SIDEBAR_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_profile');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="customer-app-layout">
      <aside className="customer-sidebar">
        <div className="customer-brand">TrackJobs</div>

        <nav className="customer-nav">
          {allowedItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `customer-nav-item${isActive ? ' is-active' : ''}`
              }
            >
              <span className="customer-nav-icon" aria-hidden="true">
                {item.icon === 'dashboard' && (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                )}
                {item.icon === 'quotes' && (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M4 4h16v12H7l-3 3V4zm3 5h10v2H7V9zm0-3h10v2H7V6zm0 6h6v2H7v-2z" />
                  </svg>
                )}
                {item.icon === 'jobs' && (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M10 4h4a2 2 0 012 2v2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2h4V6a2 2 0 012-2zm0 4h4V6h-4v2z" />
                  </svg>
                )}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="customer-logout" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="customer-main-layout">
        <header className="customer-topbar">
          <div />
          <div className="customer-topbar-actions">
            <button className="customer-icon-button" type="button" aria-label="Notifications">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 00-5-5.91V4a1 1 0 10-2 0v1.09A6 6 0 006 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </button>
            <div className="customer-profile-pill">
              <span className="customer-profile-avatar">
                {(customer?.name || 'C').slice(0, 1).toUpperCase()}
              </span>
              <span className="customer-profile-text">
                <span className="customer-profile-name">{customer?.name || 'Customer'}</span>
                <span className="customer-profile-email">{customer?.email || 'customer@trackjobs.com'}</span>
              </span>
            </div>
          </div>
        </header>

        <section className="customer-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default CustomerLayout;
