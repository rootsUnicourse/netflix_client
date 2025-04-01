import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage for API call to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API interceptor request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.config?.url, 'Status:', error.response?.status);
    console.error('Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
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
export const getMediaReviews = async (mediaId, page = 1, limit = 10, includeNonPublic = false) => {
  // Convert the boolean to a string 'true' or 'false' for the query parameter
  const includeNonPublicStr = includeNonPublic === true || includeNonPublic === 'true' ? 'true' : 'false';
  
  return api.get(`/reviews/media/${mediaId}`, {
    params: { page, limit, includeNonPublic: includeNonPublicStr }
  });
};
export const getUserReviews = async (profileId, page = 1, limit = 10) => api.get('/reviews/my-reviews', {
  params: { page, limit, profileId }
});
export const updateReview = async (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData);
export const deleteReview = async (reviewId) => api.delete(`/reviews/${reviewId}`);

// Get new releases
export const getNewReleases = async (limit = 10, mediaType = null) => api.get('/media', {
  params: { 
    sort: 'releaseDate', 
    order: 'desc', 
    limit,
    newRelease: true,
    type: mediaType
  }
});

// Get top shows in Israel
export const getTopShowsInIsrael = async (limit = 10) => api.get('/media/top-shows-israel', {
  params: { limit }
});

// Get animation media
export const getAnimationMedia = async (limit = 15) => api.get('/media/animation', {
  params: { limit }
});

// Get media by specific TMDB IDs
export const getMediaByTmdbIds = async (ids) => {
  return api.post('/media/by-tmdb-ids', { ids });
};

// Get top rated media by users
export const getTopRatedMedia = async (limit = 10, mediaType = null) => {
  try {
    // First try the primary endpoint
    return await api.get('/media/top-rated-by-users', {
      params: { limit, mediaType }
    });
  } catch (error) {
    console.error('Error with top-rated-by-users endpoint:', error.message);
    
    // Fallback to the reviews top-rated endpoint if the first one fails
    return await api.get('/reviews/top-rated', {
      params: { limit, mediaType }
    });
  }
};

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

// Get action media
export const getActionMedia = async (limit = 10) => {
  return api.get('/media', {
    params: { 
      genres: ['Action', 'Action & Adventure'],
      limit
    },
    paramsSerializer: params => {
      // Convert array parameters to repeated query params
      const queryParams = new URLSearchParams();
      for (const key in params) {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => queryParams.append(key, value));
        } else {
          queryParams.append(key, params[key]);
        }
      }
      return queryParams.toString();
    }
  });
};

// Watchlist operations
export const addToWatchlist = async (mediaId, profileId) => {
  try {
    const response = await api.post('/profiles/watchlist', { mediaId, profileId });
    return response;
  } catch (error) {
    console.error('API error adding to watchlist:', error.response?.data || error.message);
    throw error;
  }
};

export const removeFromWatchlist = async (mediaId, profileId) => {
  try {
    const response = await api.delete(`/profiles/${profileId}/watchlist/${mediaId}`);
    return response;
  } catch (error) {
    console.error('API error removing from watchlist:', error.response?.data || error.message);
    throw error;
  }
};

export const getWatchlist = async (profileId) => {
  try {
    const response = await api.get(`/profiles/${profileId}/watchlist`);
    return response;
  } catch (error) {
    console.error('API error getting watchlist:', error.response?.data || error.message);
    throw error;
  }
};

// Get AI recommendations
export const getAIRecommendations = async (mediaType = 'all', limit = 10) => {
  return api.get('/media/ai-recommendations', {
    params: { mediaType, limit }
  });
};

// Admin media operations
export const searchTMDB = async (query) => {
  return api.get(`/media/tmdb-search?query=${encodeURIComponent(query)}`);
};

export const getTMDBDetails = async (mediaType, tmdbId) => {
  return api.get(`/tmdb/details/${mediaType}/${tmdbId}`);
};

export const checkMediaExists = async (tmdbId) => {
  return api.get(`/media/exists/${tmdbId}`);
};

export const addMedia = async (mediaData) => {
  return api.post('/media', mediaData);
};

// Admin operations
export const getSystemLogs = async (params) => {
  return api.get('/admin/logs', { params });
};

// TMDB Media operations
export const getTMDBMediaDetails = async (mediaType, tmdbId) => {
  return api.get(`/media/tmdb/${mediaType}/${tmdbId}`);
};

export const getTMDBFeaturedMedia = async (mediaType = 'all', limit = 4) => {
  return api.get('/media/tmdb/featured', {
    params: { mediaType, limit }
  });
};

export const getTMDBPopularMedia = async (mediaType = 'all', limit = 4) => {
  return api.get('/tmdb/popular', {
    params: { mediaType, limit }
  });
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
  getAnimationMedia,
  getActionMedia,
  getMediaByTmdbIds,
  getMixedMedia,
  createReview,
  getMediaReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getTopRatedMedia,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  getAIRecommendations,
  searchTMDB,
  getTMDBDetails,
  checkMediaExists,
  addMedia,
  getSystemLogs,
  getTMDBMediaDetails,
  getTMDBFeaturedMedia,
  getTMDBPopularMedia,
};

export default ApiService;
