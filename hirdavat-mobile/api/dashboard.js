import axiosClient from './axiosClient';

export const fetchDashboardSummary = () => axiosClient.get('/dashboard/summary/').then((res) => res.data);

export const fetchSalesReport = (params = {}) =>
  axiosClient.get('/reports/sales/', { params }).then((res) => res.data);

export const fetchTopProducts = (params = {}) =>
  axiosClient.get('/reports/top-products/', { params }).then((res) => res.data);

export const fetchProfitReport = (params = {}) =>
  axiosClient.get('/reports/profit/', { params }).then((res) => res.data);

export const fetchCustomerBalancesReport = () =>
  axiosClient.get('/reports/customer-balances/').then((res) => res.data);
