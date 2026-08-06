import axiosClient from './axiosClient';

export const fetchCategories = () => axiosClient.get('/categories/').then((res) => res.data);

export const fetchProducts = (params = {}) =>
  axiosClient.get('/products/', { params }).then((res) => res.data);

export const fetchProduct = (id) => axiosClient.get(`/products/${id}/`).then((res) => res.data);

/**
 * imageAsset: { uri, name, type } from expo-image-picker, or null.
 */
function buildProductFormData(fields, imageAsset) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  if (imageAsset) {
    formData.append('image', {
      uri: imageAsset.uri,
      name: imageAsset.fileName || 'photo.jpg',
      type: imageAsset.mimeType || 'image/jpeg',
    });
  }
  return formData;
}

export const createProduct = (fields, imageAsset) =>
  axiosClient
    .post('/products/', buildProductFormData(fields, imageAsset), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

export const updateProduct = (id, fields, imageAsset) =>
  axiosClient
    .patch(`/products/${id}/`, buildProductFormData(fields, imageAsset), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

export const deleteProduct = (id) => axiosClient.delete(`/products/${id}/`);

export const fetchLowStockProducts = () =>
  axiosClient.get('/products/low-stock/').then((res) => res.data);

export const adjustStock = (id, payload) =>
  axiosClient.post(`/products/${id}/adjust-stock/`, payload).then((res) => res.data);
