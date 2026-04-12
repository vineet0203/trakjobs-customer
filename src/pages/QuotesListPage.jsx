import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerQuotes } from '../api/customerPortal';

const QuotesListPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const payload = await getCustomerQuotes();
        setQuotes(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch quotes.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="customer-page-card">
      <h1 className="customer-page-title">Customer Quotes</h1>
      <p className="customer-page-subtitle">Review, approve, or reject your quotes.</p>

      {loading ? <p>Loading quotes...</p> : null}
      {error ? <div className="customer-login-alert">{error}</div> : null}

      {!loading && !error ? (
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Title</th>
                <th>Status</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.quote_number}</td>
                  <td>{quote.title}</td>
                  <td>{quote.status}</td>
                  <td>{quote.currency} {Number(quote.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <Link className="customer-link-btn" to={`/quotes/${quote.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!quotes.length ? (
                <tr>
                  <td colSpan={5}>No quotes found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default QuotesListPage;
