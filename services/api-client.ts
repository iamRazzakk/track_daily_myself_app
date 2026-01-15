import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear stored token
      await AsyncStorage.removeItem('auth_token');
      setAuthToken(null);
      
      // Don't throw if it's a login/register attempt (expected 401)
      if (error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }
      
      // For other 401s, the user will be redirected to login by AuthProvider
      console.log('Session expired - redirecting to login');
    }
    
    console.error('API error', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
