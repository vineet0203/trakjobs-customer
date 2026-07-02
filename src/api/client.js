import axios from 'axios';

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000/api/v1'
  : 'https://api.trakjobs.com/api/v1';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customer_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const data = error.response.data;
      if (data?.error_code === 'VERIFICATION_REQUIRED' || data?.message?.includes('must be verified')) {
        const token = localStorage.getItem('customer_token');
        
        // Update local cache
        const customer = JSON.parse(localStorage.getItem('customer_profile') || '{}');
        customer.verification_status = 'pending';
        localStorage.setItem('customer_profile', JSON.stringify(customer));

        const vendorAppUrl = import.meta.env.VITE_VENDOR_APP_URL || 'http://localhost:5173';
        window.location.href = `${vendorAppUrl}/verification?authToken=${token}&role=Customer`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;