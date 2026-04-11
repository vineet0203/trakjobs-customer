import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

const SetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!token) {
      nextErrors.token = 'Missing password setup token.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    try {
      await apiClient.post('/customer/set-password', {
        token,
        password,
        password_confirmation: confirmPassword,
      });

      setSuccess('Password set successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (error) {
      setApiError(error?.response?.data?.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-card">
        <h1>Set Password</h1>
        <p>Create a password for your customer account.</p>

        {errors.token ? <div className="alert">{errors.token}</div> : null}
        {apiError ? <div className="alert">{apiError}</div> : null}
        {success ? <div className="success">{success}</div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={validate}
            placeholder="Enter your password"
          />
          {errors.password ? <span className="error-text">{errors.password}</span> : null}

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={validate}
            placeholder="Confirm password"
          />
          {errors.confirmPassword ? (
            <span className="error-text">{errors.confirmPassword}</span>
          ) : null}

          <button type="submit" disabled={loading || !token}>
            {loading ? 'Setting password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordPage;