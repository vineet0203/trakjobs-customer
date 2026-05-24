import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerServiceRequests, updateCustomerServiceRequestStatus } from '../api/customerPortal';

const PER_PAGE = 10;

const fmtMoney = (v) => v != null ? '$' + Number(v).toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2}) : '-';
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '-';
const fmtStatus= (s) => String(s||'').replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase()) || '-';
const norm = (s) => String(s||'').trim().toLowerCase();

const badgeClass = (s) => {
  const v = norm(s);
  if (v === 'approved' || v === 'accepted') return 'db-badge db-badge-green';
  if (v === 'pending') return 'db-badge db-badge-yellow';
  if (v === 'rejected') return 'db-badge db-badge-red';
  return 'db-badge db-badge-gray';
};

const canAct = (q) => !['accepted','rejected','approved'].includes(norm(q?.approval_status||q?.status));

const ServiceRequestsPage = () => {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]       = useState(1);
  const [error, setError]       = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [sigModal, setSigModal] = useState({ open: false, id: null });
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const payload = await getCustomerServiceRequests();
        setRequests(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch service requests.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openSigModal = (req) => {
    setSigModal({ open: true, id: req.id });
    setActionError('');
  };

  const closeSigModal = () => {
    setSigModal({ open: false, id: null });
    setActionError('');
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try { 
      await updateCustomerServiceRequestStatus(id, 'rejected'); 
      setRequests(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected', approval_status: 'rejected' } : q)); 
    }
    catch (e) { alert("Failed to reject request"); }
  };

  const submitAccept = async () => {
    if (!sigModal.id) return;
    setActionError('');
    try {
      await updateCustomerServiceRequestStatus(sigModal.id, 'accepted');
      setRequests(prev => prev.map(q => q.id === sigModal.id ? { ...q, status: 'approved', approval_status: 'accepted' } : q));
      setSigModal({ open: false, id: null });
    } catch(e) { 
      setActionError(e?.response?.data?.message || 'Failed to save.'); 
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="db-wrap">
      <div className="db-topbar" style={{marginBottom:'24px'}}>
        <div>
          <h1 className="db-title">Service Requests</h1>
          <p className="db-subtitle">Manage and respond to booking requests from the marketplace</p>
        </div>
      </div>

      <div className="db-card" style={{ minHeight: 'calc(100vh - 190px)', display: 'flex', flexDirection: 'column' }}>
        <div className="db-quotes-table-wrap" style={{flex: 1}}>
          <table className="db-table" style={{tableLayout:'fixed',width:'100%'}}>
            <thead>
              <tr>
                <th style={{width:'130px'}}>REQUEST ID</th>
                <th>CUSTOMER</th>
                <th>TITLE</th>
                <th style={{width:'130px'}}>DATE ISSUED</th>
                <th style={{width:'130px'}}>DUE DATE</th>
                <th style={{width:'120px'}}>STATUS</th>
                <th style={{width:'130px'}}>AMOUNT</th>
                <th style={{width:'250px'}}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={8} className="db-empty">{error || 'No service requests found.'}</td></tr>
              )}
              {requests.slice((page-1)*PER_PAGE, page*PER_PAGE).map((q) => (
                <tr key={q.id}>
                  <td><span className="db-qid">{q.quote_number || q.id}</span></td>
                  <td style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.client_name || '-'}</td>
                  <td style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.title || '-'}</td>
                  <td style={{whiteSpace:'nowrap'}}>{fmtDate(q.created_at)}</td>
                  <td style={{whiteSpace:'nowrap'}}>{fmtDate(q.quote_due_date || q.expires_at)}</td>
                  <td><span className={badgeClass(q.status)}>{fmtStatus(q.status)}</span></td>
                  <td style={{whiteSpace:'nowrap', fontWeight: 500}}>{parseFloat(q.total_amount) === 0 ? 'Pending Quotation' : fmtMoney(q.total_amount)}</td>
                  <td>
                    <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                      <Link className="db-btn" to={`/service-requests/${q.id}`}>View</Link>
                      {canAct(q) && (
                        <>
                          <button className="db-btn" style={{background:'#059669',color:'#fff',border:'none'}} onClick={()=>openSigModal(q)}>Accept</button>
                          <button className="db-btn" style={{background:'#DC2626',color:'#fff',border:'none'}} onClick={()=>handleReject(q.id)}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop: '20px', padding: '0 24px 24px 24px'}}>
          <Pagination page={page} total={requests.length} perPage={PER_PAGE} onPage={setPage} />
        </div>
      </div>

      <Modal isOpen={sigModal.open} title="Accept Service Request" onClose={closeSigModal}>
        <div style={{padding: '16px'}}>
          <p style={{marginBottom: '16px', fontSize: '14px'}}>Are you sure you want to accept this service request? This will inform the customer that you are available and interested.</p>
          {actionError && <p style={{color:'#DC2626',fontSize:'13px',marginBottom:'16px'}}>{actionError}</p>}
          <div style={{display:'flex',gap:'10px'}}>
            <button type="button" onClick={closeSigModal} style={{padding:'8px 16px',borderRadius:'6px',border:'1px solid #D1D5DB',background:'#fff',cursor:'pointer'}}>Cancel</button>
            <button type="button" onClick={submitAccept} style={{padding:'8px 20px',borderRadius:'6px',border:'none',background:'#059669',color:'#fff',fontWeight:600,cursor:'pointer'}}>
              Accept Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceRequestsPage;
