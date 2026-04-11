import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/customer/login', {
        email: email.trim(),
        password,
      });

      const token = response?.data?.data?.token;
      const customer = response?.data?.data?.customer;

      if (!token) {
        throw new Error('Token not found in response.');
      }

      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_profile', JSON.stringify(customer || {}));

      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setApiError(error?.response?.data?.message || 'Customer login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="auth-card">
        <h1>Customer Login</h1>
        <p>Sign in to access your customer dashboard.</p>

        {apiError ? <div className="alert">{apiError}</div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={validate}
            placeholder="name@example.com"
          />
          {errors.email ? <span className="error-text">{errors.email}</span> : null}

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

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;