import axiosClient from './axiosClient';

export const fetchCustomers = (params = {}) =>
  axiosClient.get('/customers/', { params }).then((res) => res.data);

export const fetchCustomer = (id) => axiosClient.get(`/customers/${id}/`).then((res) => res.data);

export const createCustomer = (payload) =>
  axiosClient.post('/customers/', payload).then((res) => res.data);

export const updateCustomer = (id, payload) =>
  axiosClient.patch(`/customers/${id}/`, payload).then((res) => res.data);

export const fetchCustomerBalance = (id) =>
  axiosClient.get(`/customers/${id}/balance/`).then((res) => res.data);

export const recordPayment = (id, payload) =>
  axiosClient.post(`/customers/${id}/payment/`, payload).then((res) => res.data);

export const recordDebt = (id, payload) =>
  axiosClient.post(`/customers/${id}/debt/`, payload).then((res) => res.data);

export const fetchStatement = (id, params = {}) =>
  axiosClient.get(`/customers/${id}/statement/`, { params }).then((res) => res.data);

export const statementPdfDownloadUrl = (id) => `${axiosClient.defaults.baseURL}/customers/${id}/statement/pdf/`;
