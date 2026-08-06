import axiosClient from './axiosClient';

export const fetchSales = (params = {}) => axiosClient.get('/sales/', { params }).then((res) => res.data);

export const fetchSale = (id) => axiosClient.get(`/sales/${id}/`).then((res) => res.data);

export const createSale = (payload) => axiosClient.post('/sales/', payload).then((res) => res.data);

export const cancelSale = (id, payload = {}) =>
  axiosClient.post(`/sales/${id}/cancel/`, payload).then((res) => res.data);

export const fetchDailySales = (date) =>
  axiosClient.get('/sales/daily/', { params: date ? { date } : {} }).then((res) => res.data);

export const receiptPdfDownloadUrl = (id) => `${axiosClient.defaults.baseURL}/sales/${id}/receipt/`;
