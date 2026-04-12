import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', roles: ['customer'] },
  { path: '/quotes', label: 'Quotes', roles: ['customer'] },
  { path: '/jobs', label: 'Jobs', roles: ['customer'] },
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
          <div>
            <h2>{customer?.name || 'Customer'}</h2>
            <p>{customer?.email || ''}</p>
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
