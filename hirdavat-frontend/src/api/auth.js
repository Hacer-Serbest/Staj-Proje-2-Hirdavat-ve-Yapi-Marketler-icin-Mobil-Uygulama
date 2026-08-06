import axiosClient from './axiosClient';

export const login = (username, password) =>
  axiosClient.post('/auth/login/', { username, password }).then((res) => res.data);

export const fetchMe = () => axiosClient.get('/auth/me/').then((res) => res.data);

export const updateMe = (payload) => axiosClient.patch('/auth/me/', payload).then((res) => res.data);

export const changePassword = (payload) =>
  axiosClient.post('/auth/change-password/', payload).then((res) => res.data);
