import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = searchParams.get('authToken');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await apiClient.get('/customer/me', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setCustomer(res.data?.data);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCustomer();
  }, [token, navigate]);

  if (loading) return <div style={{padding: '20px'}}>Loading...</div>;
  if (!customer) return <div style={{padding: '20px'}}>Unauthorized</div>;

  return (
    <div style={{padding: '40px', maxWidth: '600px', margin: '0 auto'}}>
      <h1>Customer Verification</h1>
      <p><strong>Email:</strong> {customer.email}</p>
      <p style={{color: 'green'}}><strong>Status:</strong> {customer.verification_status || 'pending'}</p>
      <p>Verification form placeholder - redirect after verification needed</p>
    </div>
  );
};

export default VerificationPage;
