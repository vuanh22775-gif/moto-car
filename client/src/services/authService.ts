import api from './api';
import type { User, RegisterData } from '@types';

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerUser = async (userData: RegisterData) => {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};