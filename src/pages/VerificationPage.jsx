import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState('passport');
  const [docFile, setDocFile] = useState(null);
  const token = searchParams.get('authToken');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await apiClient.get('/customer/me', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setCustomer(res.data?.data);
        setEmail(res.data?.data?.email);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCustomer();
  }, [token, navigate]);

  const sendOtp = async () => {
    try {
      await apiClient.post('/verification/otp/send', { email, phone }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStep(2);
    } catch (err) {
      alert('Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      await apiClient.post('/verification/otp/verify', { email, otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStep(3);
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  const uploadDocument = async () => {
    if (!docFile) return alert('Select a file');
    const formData = new FormData();
    formData.append('document', docFile);
    formData.append('type', docType);
    try {
      await apiClient.post('/verification/document/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Upload failed');
    }
  };

  if (loading) return <div style={{padding: '20px'}}>Loading...</div>;
  if (!customer) return <div style={{padding: '20px'}}>Unauthorized</div>;

  return (
    <div style={{padding: '40px', maxWidth: '600px', margin: '0 auto'}}>
      <h1>Customer Verification</h1>
      <p><strong>Email:</strong> {customer.email}</p>

      {step === 1 && (
        <div>
          <h3>Step 1: Phone Verification</h3>
          <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{padding: '10px', width: '100%', marginBottom: '10px'}} />
          <button onClick={sendOtp} style={{padding: '10px 20px', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer'}}>Send OTP</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Step 2: Verify OTP</h3>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} style={{padding: '10px', width: '100%', marginBottom: '10px'}} />
          <button onClick={verifyOtp} style={{padding: '10px 20px', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer'}}>Verify</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Step 3: Upload Document</h3>
          <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{padding: '10px', width: '100%', marginBottom: '10px'}}>
            <option value="passport">Passport</option>
            <option value="license">Driver License</option>
            <option value="id">National ID</option>
          </select>
          <input type="file" onChange={(e) => setDocFile(e.target.files?.[0])} style={{padding: '10px', width: '100%', marginBottom: '10px'}} />
          <button onClick={uploadDocument} style={{padding: '10px 20px', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer'}}>Complete Verification</button>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
