import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { useState, useEffect } from 'react';

const SIDEBAR_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', roles: ['customer'], icon: 'dashboard' },
  { path: '/quotes', label: 'Quotes', roles: ['customer'], icon: 'quotes' },
  { path: '/jobs', label: 'Jobs', roles: ['customer'], icon: 'jobs' },
];

const CustomerLayout = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'customer';
  const [customer, setCustomer] = useState(JSON.parse(localStorage.getItem('customer_profile') || '{}'));

  useEffect(() => {
    const sync = () => {
    const fresh = JSON.parse(localStorage.getItem('customer_profile') || '{}');
    setCustomer(fresh);
  };
  sync();
  window.addEventListener('customer_profile_updated', sync);
  window.addEventListener('storage', sync);
  return () => {
    window.removeEventListener('customer_profile_updated', sync);
    window.removeEventListener('storage', sync);
  };
  }, []);

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
        <div className="customer-brand">TRAKJOBS</div>

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
            <NotificationDropdown />
            <div className="customer-profile-pill">
              <span className="customer-profile-avatar">
                {customer?.profile_photo
                  ? <img src={customer.profile_photo} alt="avatar" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
                  : (customer?.name || 'C').slice(0, 1).toUpperCase()
                }
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
