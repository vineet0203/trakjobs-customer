import apiClient from './client';

export const getCustomerQuotes = async () => {
  const response = await apiClient.get('/customer/quotes');
  return response.data?.data?.data || response.data?.data || [];
};

export const getCustomerQuoteById = async (id) => {
  const response = await apiClient.get(`/customer/quotes/${id}`);
  return response.data?.data;
};

export const updateCustomerQuoteApproval = async (id, action) => {
  const response = await apiClient.patch(`/customer/quotes/${id}/approval`, { action });
  return response.data?.data;
};

export const decideQuote = async (id, payload) => {
  const response = await apiClient.post(`/customer/quotes/${id}/decision`, payload);
  return response.data?.data;
};

export const submitQuote = async (id, payload) => {
  const response = await apiClient.post(`/customer/quotes/${id}/submit`, payload);
  return response.data?.data;
};

export const getCustomerJobs = async () => {
  const response = await apiClient.get('/customer/jobs');
  return response.data?.data?.data || [];
};

export const getCustomerJobById = async (id) => {
  const response = await apiClient.get(`/customer/jobs/${id}`);
  return response.data?.data;
};

export const getCustomerProfile = async () => {
  const response = await apiClient.get('/customer/me');
  return response.data?.data || response.data;
};
