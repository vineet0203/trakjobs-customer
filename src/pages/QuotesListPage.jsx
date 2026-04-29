import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerQuotes, updateCustomerQuoteApproval } from '../api/customerPortal';

const QuotesListPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleApproval = async (event, quoteId, action) => {
    event.preventDefault();
    if (updatingId) return;

    setUpdatingId(quoteId);
    setError('');

    try {
      const updatedQuote = await updateCustomerQuoteApproval(quoteId, action);
      setQuotes((prevQuotes) =>
        prevQuotes.map((quote) => (quote.id === updatedQuote?.id ? { ...quote, ...updatedQuote } : quote))
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update quote approval.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getApprovalStatus = (quote) => {
    return quote.approval_status || quote.client_approval?.status || quote.status || '-';
  };

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
              {quotes.map((quote) => {
                const status = getApprovalStatus(quote).toLowerCase();
                const canAct = status === 'pending' || status === 'draft' || status === '-';
                return (
                  <tr key={quote.id}>
                    <td>{quote.quote_number}</td>
                    <td>{quote.title}</td>
                    <td>{formatStatus(getApprovalStatus(quote))}</td>
                    <td>{quote.currency} {Number(quote.total_amount || 0).toFixed(2)}</td>
                    <td>
                      <Link className="customer-link-btn" to={`/quotes/${quote.id}`}>
                        View
                      </Link>
                      {canAct && (
                        <>
                          {' | '}
                          <a
                            href="#"
                            className="customer-link-btn"
                            role="button"
                            aria-disabled={updatingId === quote.id}
                            onClick={(event) => handleApproval(event, quote.id, 'approve')}
                          >
                            Accept
                          </a>
                          {' | '}
                          <a
                            href="#"
                            className="customer-link-btn"
                            role="button"
                            aria-disabled={updatingId === quote.id}
                            onClick={(event) => handleApproval(event, quote.id, 'reject')}
                          >
                            Reject
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
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

const formatStatus = (status) =>
  String(status || '-')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
