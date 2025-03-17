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

// Media operations
export const getMedia = async (params) => api.get('/media', { params });
export const getMediaById = async (id) => api.get(`/media/id/${id}`);
export const getFeaturedMedia = async (limit = 8) => api.get('/media', { 
  params: { sort: 'releaseDate', order: 'desc', limit } 
});

// Review operations
export const createReview = async (reviewData) => api.post('/reviews', reviewData);
export const getMediaReviews = async (mediaId) => api.get(`/reviews/media/${mediaId}`);
export const getUserReviews = async () => api.get('/reviews/my-reviews');
export const updateReview = async (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData);
export const deleteReview = async (reviewId) => api.delete(`/reviews/${reviewId}`);

// Get new releases
export const getNewReleases = async (limit = 10) => api.get('/media', {
  params: { 
    sort: 'releaseDate', 
    order: 'desc', 
    limit,
    newRelease: true
  }
});

// Get top shows in Israel
export const getTopShowsInIsrael = async (limit = 10) => api.get('/media/top-shows-israel', {
  params: { limit }
});

// Get mixed media with different criteria to ensure we get enough items
export const getMixedMedia = async (count = 4) => {
  // First try to get all available media
  const response = await api.get('/media', { 
    params: { limit: 100 } // Get all available media
  });
  
  let results = [];
  
  if (response.data.results && response.data.results.length > 0) {
    // Use the actual items first
    results = [...response.data.results];
    
    // If we don't have enough items, create virtual variants
    if (results.length < count) {
      const originalCount = results.length;
      
      // Create virtual items by modifying existing ones
      for (let i = 0; i < originalCount && results.length < count; i++) {
        const original = results[i];
        
        // Create a "featured" variant
        const featuredVariant = {
          ...original,
          _id: `${original._id}-featured`,
          title: `${original.title} (Featured)`,
          featured: true
        };
        
        // Create a "trending" variant
        const trendingVariant = {
          ...original,
          _id: `${original._id}-trending`,
          title: `${original.title} (Trending)`,
          trending: true
        };
        
        // Add variants if we still need more items
        if (results.length < count) results.push(featuredVariant);
        if (results.length < count) results.push(trendingVariant);
      }
    }
  }
  
  // Return combined results (limited to requested count)
  return {
    data: {
      results: results.slice(0, count),
      totalResults: results.length,
      page: 1,
      totalPages: 1
    }
  };
};

const ApiService = {
  signUp,
  login,
  getProfiles,
  addProfile,
  deleteProfile,
  updateProfileName,
  getMedia,
  getMediaById,
  getFeaturedMedia,
  getNewReleases,
  getTopShowsInIsrael,
  getMixedMedia,
  createReview,
  getMediaReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};

export default ApiService;
