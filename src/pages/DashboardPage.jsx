import { useEffect, useMemo, useState } from 'react';
import { getCustomerJobs, getCustomerProfile, getCustomerQuotes } from '../api/customerPortal';
import Modal from '../components/Modal';
import './DashboardPage.css';

const DashboardPage = () => {
  const [customer, setCustomer] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [profile, customerQuotes, customerJobs] = await Promise.all([
          getCustomerProfile(),
          getCustomerQuotes(),
          getCustomerJobs(),
        ]);

        if (isMounted) {
          setCustomer(profile || null);
          setQuotes(Array.isArray(customerQuotes) ? customerQuotes : []);
          setJobs(Array.isArray(customerJobs) ? customerJobs : []);
          setProfileError('');
          setDataError('');
        }
      } catch (error) {
        if (isMounted) {
          setProfileError('Unable to load customer profile.');
          setDataError('Unable to load customer dashboard data.');
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalQuotes = quotes.length;
    const approvedQuotes = quotes.filter((quote) => normalizeStatus(quote.status) === 'approved').length;
    const activeJobs = jobs.filter((job) => normalizeStatus(job.status) !== 'completed').length;
    const pendingPayments = jobs.filter((job) => normalizeStatus(job.status) === 'pending payment').length;

    return [
      { label: 'Total Quotes Received', value: totalQuotes, color: 'orange' },
      { label: 'Approved Quotes', value: approvedQuotes, color: 'green' },
      { label: 'Active Jobs', value: activeJobs, color: 'yellow' },
      { label: 'Pending Payments', value: pendingPayments, color: 'brown' },
    ];
  }, [quotes, jobs]);

  return (
    <div className="dashboard">
      <section className="stats-row">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-info">
              <h3>{stat.label}</h3>
              <h2>{stat.value}</h2>
            </div>
            <div className={`stat-icon ${stat.color}`}>
              {getStatIcon(stat.color)}
            </div>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <div className="section-header">
            <h3 className="section-title">Quotes to Review</h3>
          </div>
          <div className="review-list">
            {quotes.map((quote) => (
              <div key={quote.id || quote.uuid} className="review-item">
                <div className="review-meta">
                  <span className="review-amount">{formatMoney(quote.amount)}</span>
                  <span className="review-vendor">{quote.vendor?.name || quote.vendor_name || quote.vendorName || '-'}</span>
                </div>
                <span className={`status-badge ${getStatusClass(quote.status)}`}>{formatStatus(quote.status)}</span>
              </div>
            ))}
            {!quotes.length && !dataError && (
              <p className="customer-empty-state">No quotes available yet.</p>
            )}
            {dataError && (
              <p className="customer-empty-state">{dataError}</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-header">
            <h3 className="section-title">My Jobs</h3>
          </div>
          <div className="job-list">
            {jobs.map((job) => (
              <div key={job.id || job.uuid} className="job-item">
                <div>
                  <p className="job-title">{job.title || job.name || job.job_title || 'Job'} </p>
                  <p className="job-date">{formatDate(job.date || job.start_date || job.scheduled_at)}</p>
                </div>
                <span className={`status-badge ${getJobStatusClass(job.status)}`}>{formatStatus(job.status)}</span>
              </div>
            ))}
            {!jobs.length && !dataError && (
              <p className="customer-empty-state">No jobs available yet.</p>
            )}
            {dataError && (
              <p className="customer-empty-state">{dataError}</p>
            )}
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="client-profile">
          <div className="client-profile-header"></div>
          <div className="client-avatar"></div>
          <div className="client-info">
            <h2 className="client-name">{customer?.name || 'Customer'}</h2>
            <p className="client-address">{customer?.email || 'customer@trackjobs.com'}</p>
            <button className="button-primary" type="button" onClick={() => setIsProfileOpen(true)}>
              View Profile
            </button>
            {profileError && <p className="customer-profile-error">{profileError}</p>}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isProfileOpen}
        title="Customer Profile"
        onClose={() => setIsProfileOpen(false)}
      >
        <div className="customer-profile-details">
          <div>
            <p className="customer-profile-label">Name</p>
            <p className="customer-profile-value">{customer?.name || '-'}</p>
          </div>
          <div>
            <p className="customer-profile-label">Email</p>
            <p className="customer-profile-value">{customer?.email || '-'}</p>
          </div>
          <div>
            <p className="customer-profile-label">Phone</p>
            <p className="customer-profile-value">{customer?.phone || '-'}</p>
          </div>
          <div>
            <p className="customer-profile-label">Created By Vendor</p>
            <p className="customer-profile-value">{customer?.createdByVendor?.name || '-'}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;

const getStatusClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'status-approved';
    case 'Rejected':
      return 'status-rejected';
    default:
      return 'status-pending';
  }
};

const getJobStatusClass = (status) => {
  return status === 'Completed' ? 'status-approved' : 'status-in-progress';
};

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const formatStatus = (status) => String(status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '-';

const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '-';
  }

  if (typeof amount === 'number') {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }

  return String(amount);
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatIcon = (color) => {
  switch (color) {
    case 'green':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      );
    case 'orange':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 00-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" />
        </svg>
      );
    case 'brown':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      );
    case 'yellow':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="4" width="16" height="15" rx="2" stroke="black" strokeWidth="2" fill="none" />
          <line x1="3" y1="9" x2="19" y2="9" stroke="black" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};