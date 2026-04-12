import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignaturePad from '../components/SignaturePad';
import { decideQuote, getCustomerQuoteById, submitQuote } from '../api/customerPortal';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [approvedPrice, setApprovedPrice] = useState('');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const payload = await getCustomerQuoteById(id);
        setQuote(payload);
        setApprovedPrice(payload?.customer_approved_price || payload?.total_amount || '');
        setSignature(payload?.customer_signature || '');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch quote details.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const updateQuote = async (action, useSubmitEndpoint = false) => {
    if (!quote) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        action,
        approved_price: approvedPrice ? Number(approvedPrice) : null,
        signature,
        notes,
      };

      const data = useSubmitEndpoint
        ? await submitQuote(id, payload)
        : await decideQuote(id, payload);

      setQuote(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update quote.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="customer-page-card"><p>Loading quote details...</p></div>;
  }

  if (!quote) {
    return <div className="customer-page-card"><p>Quote not found.</p></div>;
  }

  return (
    <div className="customer-page-card">
      <h1 className="customer-page-title">Quote Detail</h1>
      <p className="customer-page-subtitle">Approve or reject this quote.</p>

      {error ? <div className="customer-login-alert">{error}</div> : null}

      <div className="customer-detail-grid">
        <p><strong>Quote Number:</strong> {quote.quote_number}</p>
        <p><strong>Title:</strong> {quote.title}</p>
        <p><strong>Status:</strong> {quote.status}</p>
        <p><strong>Total:</strong> {quote.currency} {Number(quote.total_amount || 0).toFixed(2)}</p>
      </div>

      <label className="customer-login-label" htmlFor="approvedPrice">Approved Price</label>
      <input
        id="approvedPrice"
        type="number"
        min="0"
        value={approvedPrice}
        onChange={(event) => setApprovedPrice(event.target.value)}
      />

      <label className="customer-login-label" htmlFor="notes">Notes</label>
      <textarea
        id="notes"
        className="customer-textarea"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <label className="customer-login-label">Digital Signature</label>
      <SignaturePad onChange={setSignature} />

      <div className="customer-action-row">
        <button className="customer-secondary-btn" type="button" onClick={() => navigate('/quotes')}>
          Back
        </button>
        <button className="customer-danger-btn" type="button" disabled={submitting} onClick={() => updateQuote('reject')}>
          Reject
        </button>
        <button className="customer-dashboard-button" type="button" disabled={submitting} onClick={() => updateQuote('approve')}>
          Approve
        </button>
        <button className="customer-dashboard-button" type="button" disabled={submitting} onClick={() => updateQuote('submit', true)}>
          Submit Final
        </button>
      </div>
    </div>
  );
};

export default QuoteDetailPage;
