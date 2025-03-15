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

export const signUp = async (payload) => api.post('/auth/signup', payload);
export const login = async (payload) => api.post('/auth/login', payload);

// Profile operations
export const getProfiles = async () => api.get('/profiles');
export const addProfile = async (profileData) => api.post('/profiles/add', profileData);
export const deleteProfile = async (profileId) => api.delete(`/profiles/${profileId}`);
export const updateProfileName = async (profileId, name) => api.put(`/profiles/${profileId}`, { name });

const ApiService = {
  signUp,
  login,
  getProfiles,
  addProfile,
  deleteProfile,
  updateProfileName,
};

export default ApiService;
