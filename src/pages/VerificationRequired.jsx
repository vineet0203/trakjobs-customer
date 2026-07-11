import { useNavigate } from 'react-router-dom';
import { LockKeyhole, LogOut } from 'lucide-react';
import './VerificationRequired.css';

export default function VerificationRequired() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_profile');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <div className="verification-required-container">
      <div className="verification-required-card">
        <div className="icon-wrapper">
          <LockKeyhole size={48} className="lock-icon" />
        </div>

        <h1 className="title">Account Verification Required</h1>
        
        <p className="description">
          Your account is not verified yet. Please complete the verification process to unlock your dashboard and access all features.
        </p>

        <div className="button-group">
          <button
            onClick={() => navigate('/verification')}
            className="verify-btn"
          >
            Verify My Account
          </button>

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
