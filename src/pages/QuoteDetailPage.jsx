import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerQuoteById } from '../api/customerPortal';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const payload = await getCustomerQuoteById(id);
        setQuote(payload);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch quote details.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return <div className="customer-page-card"><p>Loading quote details...</p></div>;
  }

  if (!quote) {
    return <div className="customer-page-card"><p>Quote not found.</p></div>;
  }

  return (
    <div className="customer-page-card">
      <h1 className="customer-page-title">Quote Detail</h1>
      <p className="customer-page-subtitle">View quote details (Read-Only).</p>

      {error ? <div className="customer-login-alert">{error}</div> : null}

      <div className="customer-detail-grid" style={{ marginBottom: '20px' }}>
        <div>
          <label className="customer-login-label">Quote Number</label>
          <input type="text" className="customer-login-input" value={quote.quote_number || ''} disabled />
        </div>
        <div>
          <label className="customer-login-label">Title</label>
          <input type="text" className="customer-login-input" value={quote.title || ''} disabled />
        </div>
        <div>
          <label className="customer-login-label">Status</label>
          <input type="text" className="customer-login-input" value={quote.status || ''} disabled />
        </div>
        <div>
          <label className="customer-login-label">Due Date</label>
          <input type="text" className="customer-login-input" value={quote.quote_due_date || '-'} disabled />
        </div>
      </div>

      <h3 className="customer-page-title" style={{ fontSize: '18px', marginTop: '30px' }}>Line Items</h3>
      <div className="customer-table-wrap" style={{ marginBottom: '20px' }}>
        <table className="customer-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price ({quote.currency || '$'})</th>
              <th>Tax Rate (%)</th>
              <th>Total ({quote.currency || '$'})</th>
            </tr>
          </thead>
          <tbody>
            {(quote.items && quote.items.length > 0) ? quote.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.item_name}</td>
                <td>{item.description || '-'}</td>
                <td>{item.quantity}</td>
                <td>{Number(item.unit_price).toFixed(2)}</td>
                <td>{Number(item.tax_rate).toFixed(2)}</td>
                <td>{Number((item.quantity * item.unit_price) * (1 + item.tax_rate/100)).toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <strong>Subtotal:</strong>
            <span>{quote.currency || '$'} {Number(quote.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <strong>Discount:</strong>
            <span>{quote.currency || '$'} {Number(quote.discount || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #eee', marginTop: '8px' }}>
            <strong>Total:</strong>
            <strong>{quote.currency || '$'} {Number(quote.total_amount || 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <h3 className="customer-page-title" style={{ fontSize: '18px' }}>Client Approval</h3>
      <div className="customer-detail-grid" style={{ marginBottom: '20px' }}>
        <div>
          <label className="customer-login-label">Approval Status</label>
          <input type="text" className="customer-login-input" value={quote.approval_status || 'Pending'} disabled />
        </div>
        <div>
          <label className="customer-login-label">Approval Date</label>
          <input type="text" className="customer-login-input" value={quote.approval_date || '-'} disabled />
        </div>
        <div>
          <label className="customer-login-label">Approved Price ({quote.currency || '$'})</label>
          <input type="text" className="customer-login-input" value={Number(quote.customer_approved_price || quote.total_amount || 0).toFixed(2)} disabled />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label className="customer-login-label">Notes</label>
        <textarea
          className="customer-login-input"
          style={{ height: '100px', resize: 'vertical' }}
          value={quote.notes || 'No notes provided.'}
          disabled
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label className="customer-login-label">Digital Signature</label>
        {quote.customer_signature || quote.client_signature ? (
          <img
            style={{ border: '1px solid #ccc', borderRadius: '4px', maxWidth: '400px', width: '100%', background: '#f9f9f9', padding: '10px' }}
            src={quote.customer_signature || quote.client_signature}
            alt="Signature"
          />
        ) : (
          <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '4px', color: '#666' }}>
            No signature on file.
          </div>
        )}
      </div>

      <div className="customer-action-row" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button className="customer-login-btn" style={{ background: '#6c757d', maxWidth: '200px' }} type="button" onClick={() => navigate('/quotes')}>
          Back to Quotes
        </button>
      </div>
    </div>
  );
};

export default QuoteDetailPage;

