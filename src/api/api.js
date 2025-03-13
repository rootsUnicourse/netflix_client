import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const signUp = async (payload) => {
  return api.post('/auth/signup', payload);
};

export const login = async (payload) => {
  return api.post('/auth/login', payload);
};

const ApiService = {
  signUp,
  login,
};

export default ApiService;
