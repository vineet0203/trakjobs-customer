import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const token = searchParams.get('authToken');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await apiClient.get('/customer/me', { headers: { Authorization: `Bearer ${token}` } });
        setCustomer(res.data?.data);
      } catch (err) {
        console.error('Failed to fetch customer:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCustomer();
  }, [token, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Unauthorized</div>;

  return (
    <div className="verification-center">
      <h1>Customer Verification</h1>
      <p>Email: {customer.email}</p>
      {/* Add verification form here similar to vendor but for customer */}
    </div>
  );
};

export default VerificationPage;
