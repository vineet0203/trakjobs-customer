import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VerificationWizard from '../components/VerificationWizard';
import { customerPortal } from '../api/customerPortal';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const urlToken = searchParams.get('authToken');
        if (urlToken) {
          localStorage.setItem('customer_token', urlToken);
          window.history.replaceState({}, '', '/dashboard');
        }

        const customer = JSON.parse(localStorage.getItem('customer_profile') || '{}');
        if (customer.verification_status === 'verified') {
          navigate('/dashboard', { replace: true });
          return;
        }

        const res = await customerPortal.getVerificationProgress();
        setVerificationData(res.data);
      } catch (err) {
        console.error('Verification init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d1b2a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <VerificationWizard initialData={verificationData} />
    </div>
  );
};

export default VerificationPage;
