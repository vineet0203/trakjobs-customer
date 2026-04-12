import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerJobById } from '../api/customerPortal';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const payload = await getCustomerJobById(id);
        setJob(payload);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return <div className="customer-page-card"><p>Loading job details...</p></div>;
  }

  if (!job) {
    return <div className="customer-page-card"><p>Job not found.</p></div>;
  }

  return (
    <div className="customer-page-card">
      <h1 className="customer-page-title">Job Detail</h1>
      <p className="customer-page-subtitle">View-only job details for customer.</p>

      {error ? <div className="customer-login-alert">{error}</div> : null}

      <div className="customer-detail-grid">
        <p><strong>Job Number:</strong> {job.job_number}</p>
        <p><strong>Title:</strong> {job.title}</p>
        <p><strong>Status:</strong> {job.status}</p>
        <p><strong>Job Rate:</strong> {job.job_rate?.formatted}</p>
        <p><strong>Location:</strong> {job.location?.full_address || '-'}</p>
      </div>

      <h3 className="customer-section-heading">Schedules</h3>
      <div className="customer-table-wrap">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(job.schedules || []).map((schedule) => (
              <tr key={schedule.id}>
                <td>{schedule.schedule_date || '-'}</td>
                <td>{schedule.start_time || '-'}</td>
                <td>{schedule.end_time || '-'}</td>
                <td>{schedule.location || '-'}</td>
                <td>{schedule.status || '-'}</td>
              </tr>
            ))}
            {!job.schedules?.length ? (
              <tr>
                <td colSpan={5}>No schedules found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="customer-action-row">
        <button className="customer-secondary-btn" type="button" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </button>
      </div>
    </div>
  );
};

export default JobDetailPage;
