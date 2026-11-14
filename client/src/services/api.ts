import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agroguide_token') || 'demo-token-1234567890';
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response handler
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      message: error.message || 'Network error occurred',
      error: { code: 'NETWORK_ERROR', details: [error.message] }
    };
    return Promise.reject(errorData);
  }
);

// Typed API helper services
export const Api = {
  // Auth & Profile
  getMe: () => apiClient.get('/auth/me'),
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data: any) => apiClient.put('/profile', data),

  // Farms
  getFarms: () => apiClient.get('/farms'),
  createFarm: (data: any) => apiClient.post('/farms', data),
  getFarm: (id: string) => apiClient.get(`/farms/${id}`),
  updateFarm: (id: string, data: any) => apiClient.put(`/farms/${id}`, data),
  deleteFarm: (id: string) => apiClient.delete(`/farms/${id}`),

  // Advisory Endpoints
  recommendCrops: (data: any) => apiClient.post('/advisory/crop-recommendation', data),
  analyzeSoil: (data: any) => apiClient.post('/advisory/soil-analysis', data),
  recommendFertilizer: (data: any) => apiClient.post('/advisory/fertilizer', data),
  recommendIrrigation: (data: any) => apiClient.post('/advisory/irrigation', data),
  detectDisease: (formData: FormData) =>
    apiClient.post('/advisory/disease-detection', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Weather
  getCurrentWeather: (location?: string, state?: string) =>
    apiClient.get('/weather/current', { params: { location, state } }),
  getWeatherForecast: (location?: string, state?: string) =>
    apiClient.get('/weather/forecast', { params: { location, state } }),

  // Chatbot
  sendChatMessage: (data: { conversation_id?: string; message: string; language?: string }) =>
    apiClient.post('/chat', data),
  getChatConversations: () => apiClient.get('/chat/conversations'),
  getChatMessages: (conversationId: string) => apiClient.get(`/chat/conversations/${conversationId}`),
  deleteChatConversation: (conversationId: string) => apiClient.delete(`/chat/conversations/${conversationId}`),

  // History & Details
  getHistory: (params?: { type?: string; page?: number; limit?: number }) =>
    apiClient.get('/history', { params }),
  getHistoryDetail: (id: string) => apiClient.get(`/history/${id}`),
  deleteHistoryItem: (id: string) => apiClient.delete(`/history/${id}`),

  // Dashboard Statistics
  getDashboardStats: () => apiClient.get('/dashboard/stats')
};
