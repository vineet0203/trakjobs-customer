import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerJobs } from '../api/customerPortal';

const JobsListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const payload = await getCustomerJobs();
        setJobs(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch jobs.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="customer-page-card">
      <h1 className="customer-page-title">Jobs</h1>
      <p className="customer-page-subtitle">View your jobs. Editing is restricted to vendors.</p>

      {loading ? <p>Loading jobs...</p> : null}
      {error ? <div className="customer-login-alert">{error}</div> : null}

      {!loading && !error ? (
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Title</th>
                <th>Status</th>
                <th>Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.job_number}</td>
                  <td>{job.title}</td>
                  <td>{job.status}</td>
                  <td>{job.job_rate?.formatted}</td>
                  <td>
                    <Link className="customer-link-btn" to={`/jobs/${job.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!jobs.length ? (
                <tr>
                  <td colSpan={5}>No jobs found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default JobsListPage;
