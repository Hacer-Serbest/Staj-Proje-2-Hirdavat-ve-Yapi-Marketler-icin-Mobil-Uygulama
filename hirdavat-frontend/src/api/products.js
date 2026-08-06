import axiosClient from './axiosClient';

export const fetchCategories = () => axiosClient.get('/categories/').then((res) => res.data);

export const createCategory = (payload) =>
  axiosClient.post('/categories/', payload).then((res) => res.data);

export const fetchProducts = (params = {}) =>
  axiosClient.get('/products/', { params }).then((res) => res.data);

export const fetchProduct = (id) => axiosClient.get(`/products/${id}/`).then((res) => res.data);

export const createProduct = (payload) => {
  const isFormData = payload instanceof FormData;
  return axiosClient
    .post('/products/', payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
    .then((res) => res.data);
};

export const updateProduct = (id, payload) => {
  const isFormData = payload instanceof FormData;
  return axiosClient
    .patch(`/products/${id}/`, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
    .then((res) => res.data);
};

export const deleteProduct = (id) => axiosClient.delete(`/products/${id}/`);

export const fetchLowStockProducts = () =>
  axiosClient.get('/products/low-stock/').then((res) => res.data);

export const adjustStock = (id, payload) =>
  axiosClient.post(`/products/${id}/adjust-stock/`, payload).then((res) => res.data);
