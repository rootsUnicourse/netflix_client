import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminMediaInsert = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(UserContext);
  
  // If not admin, redirect to home
  React.useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  // Form states
  const [formData, setFormData] = useState({
    tmdbId: '',
    title: '',
    type: 'movie',
    overview: '',
    posterPath: '',
    backdropPath: '',
    genres: [],
    releaseDate: '',
    popularity: 0,
    voteAverage: 0,
    voteCount: 0,
    runtime: 0,
    seasons: 0,
    status: '',
    originalLanguage: '',
    cast: [],
    trailerKey: '',
    director: '',
    creators: [],
    contentTags: [],
    maturityRating: '',
    additionalImages: [],
    featured: false,
    trending: false,
    newRelease: false,
    popularInIsrael: false
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle boolean switches
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle array inputs (comma separated)
  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.split(',').map(item => item.trim()).filter(item => item !== '')
    });
  };

  // Search TMDB for media
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      // Make a direct search to TMDB API
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media/tmdb-search?query=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data.results);
    } catch (error) {
      setNotification({
        open: true,
        message: `Search failed: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load media details from TMDB
  const loadMediaDetails = async (result) => {
    setLoading(true);
    try {
      const mediaType = result.media_type;
      const tmdbId = result.id;
      
      // Use the new endpoint that doesn't store data
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media/tmdb-details/${mediaType}/${tmdbId}`);
      const media = response.data;
      
      // If this media already exists in the database, show a warning
      if (media.exists_in_database) {
        setNotification({
          open: true,
          message: `Warning: This media already exists in your database. Adding it again will create a duplicate.`,
          severity: 'warning'
        });
      } else {
        setNotification({
          open: true,
          message: `Media details loaded: ${media.title}`,
          severity: 'success'
        });
      }
      
      // Transform the response data to match our form structure
      setFormData({
        tmdbId: media.tmdbId,
        title: media.title,
        type: media.type,
        overview: media.overview,
        posterPath: media.posterPath,
        backdropPath: media.backdropPath,
        genres: media.genres,
        releaseDate: media.releaseDate ? new Date(media.releaseDate).toISOString().split('T')[0] : '',
        popularity: media.popularity || 0,
        voteAverage: media.voteAverage || 0,
        voteCount: media.voteCount || 0,
        runtime: media.runtime || 0,
        seasons: media.seasons || 0,
        status: media.status || '',
        originalLanguage: media.originalLanguage || '',
        cast: media.cast || [],
        trailerKey: media.trailerKey || '',
        director: media.director || '',
        creators: media.creators || [],
        contentTags: media.contentTags || [],
        maturityRating: media.maturityRating || '',
        additionalImages: media.additionalImages || [],
        featured: false,
        trending: false,
        newRelease: false,
        popularInIsrael: false
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to load media details: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit the form to create new media
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.tmdbId || !formData.title || !formData.type || !formData.overview) {
      setNotification({
        open: true,
        message: 'Please fill all required fields: ID, title, type, and overview',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // First, check if this media already exists in the database
      const checkResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media/exists/${formData.tmdbId}`
      );
      
      if (checkResponse.data.exists) {
        setNotification({
          open: true,
          message: `This media already exists in the database (TMDB ID: ${formData.tmdbId})`,
          severity: 'warning'
        });
        setLoading(false);
        return;
      }
      
      // Proceed with adding the media
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setNotification({
        open: true,
        message: `Successfully added ${formData.title}`,
        severity: 'success'
      });
      
      // Reset form
      setTimeout(() => {
        setFormData({
          tmdbId: '',
          title: '',
          type: 'movie',
          overview: '',
          posterPath: '',
          backdropPath: '',
          genres: [],
          releaseDate: '',
          popularity: 0,
          voteAverage: 0,
          voteCount: 0,
          runtime: 0,
          seasons: 0,
          status: '',
          originalLanguage: '',
          cast: [],
          trailerKey: '',
          director: '',
          creators: [],
          contentTags: [],
          maturityRating: '',
          additionalImages: [],
          featured: false,
          trending: false,
          newRelease: false,
          popularInIsrael: false
        });
        setSearchResults([]);
        setSearchQuery('');
      }, 2000);
    } catch (error) {
      console.error('Error adding media:', error);
      let errorMessage = error.response?.data?.message || error.message;
      
      // Handle specific error cases
      if (errorMessage.includes('TMDB ID already exists')) {
        errorMessage = `Media with TMDB ID ${formData.tmdbId} already exists in the database`;
      }
      
      setNotification({
        open: true,
        message: `Failed to add media: ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Helper to render cast list
  const renderCastList = () => {
    return formData.cast.map((actor, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2">
          {actor.name} as {actor.character}
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => {
            const newCast = [...formData.cast];
            newCast.splice(index, 1);
            setFormData({ ...formData, cast: newCast });
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Media from TMDB
        </Typography>
        
        {/* Information alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Search for movies and TV shows directly from TMDB that aren't already in your database.
          Results that already exist in your database will be marked and can't be selected.
        </Alert>
        
        {/* TMDB Search Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search TMDB
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <TextField
                fullWidth
                label="Search for Movie or TV Show"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Search Results
              </Typography>
              <Grid container spacing={2}>
                {searchResults.map((result) => (
                  <Grid item xs={12} sm={6} md={4} key={result.id}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column',
                        height: '100%',
                        cursor: result.exists_in_database ? 'not-allowed' : 'pointer',
                        '&:hover': { 
                          backgroundColor: result.exists_in_database ? 'inherit' : 'rgba(0,0,0,0.05)'
                        },
                        opacity: result.exists_in_database ? 0.6 : 1,
                        position: 'relative',
                        border: result.exists_in_database ? '1px solid #f44336' : 'none'
                      }}
                      onClick={() => !result.exists_in_database && loadMediaDetails(result)}
                    >
                      {result.exists_in_database && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0,
                            backgroundColor: '#f44336',
                            color: 'white',
                            padding: '2px 8px',
                            fontSize: '12px',
                            borderBottomLeftRadius: '4px'
                          }}
                        >
                          Already exists
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {result.poster_path && (
                          <Box sx={{ mr: 2 }}>
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                              alt={result.title || result.name}
                              style={{ width: '60px', borderRadius: '4px' }}
                            />
                          </Box>
                        )}
                        <Box>
                          <Typography variant="subtitle1">
                            {result.title || result.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {result.media_type === 'movie' ? 'Movie' : 'TV Show'} • 
                            {result.release_date 
                              ? new Date(result.release_date).getFullYear()
                              : result.first_air_date 
                                ? new Date(result.first_air_date).getFullYear()
                                : 'N/A'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Media Details
          </Typography>
          
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="TMDB ID"
                name="tmdbId"
                value={formData.tmdbId}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="movie">Movie</MenuItem>
                  <MenuItem value="tv">TV Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Overview"
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            
            {/* Media Properties */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Poster Path (URL)"
                name="posterPath"
                value={formData.posterPath}
                onChange={handleChange}
              />
              {formData.posterPath && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img 
                    src={formData.posterPath} 
                    alt="Poster" 
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Backdrop Path (URL)"
                name="backdropPath"
                value={formData.backdropPath}
                onChange={handleChange}
              />
              {formData.backdropPath && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img 
                    src={formData.backdropPath} 
                    alt="Backdrop" 
                    style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Grid>
            
            {/* Metadata */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Genres (comma separated)"
                name="genres"
                value={formData.genres.join(', ')}
                onChange={handleArrayChange}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {formData.genres.map((genre, index) => (
                  <Chip 
                    key={index} 
                    label={genre} 
                    size="small"
                    onDelete={() => {
                      const newGenres = [...formData.genres];
                      newGenres.splice(index, 1);
                      setFormData({ ...formData, genres: newGenres });
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Release Date"
                name="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Ratings and Metrics */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Popularity"
                name="popularity"
                type="number"
                value={formData.popularity}
                onChange={handleChange}
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Vote Average"
                name="voteAverage"
                type="number"
                value={formData.voteAverage}
                onChange={handleChange}
                inputProps={{ step: 0.1, min: 0, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Vote Count"
                name="voteCount"
                type="number"
                value={formData.voteCount}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Type-specific Fields */}
            {formData.type === 'movie' ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Runtime (minutes)"
                  name="runtime"
                  type="number"
                  value={formData.runtime}
                  onChange={handleChange}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Seasons"
                  name="seasons"
                  type="number"
                  value={formData.seasons}
                  onChange={handleChange}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Cast */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Cast
              </Typography>
              {renderCastList()}
            </Grid>
            
            {/* Media Links */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Trailer YouTube Key"
                name="trailerKey"
                value={formData.trailerKey}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={formData.type === 'movie' ? 'Director' : 'Creators (comma separated)'}
                name={formData.type === 'movie' ? 'director' : 'creators'}
                value={formData.type === 'movie' ? formData.director : formData.creators.join(', ')}
                onChange={formData.type === 'movie' ? handleChange : handleArrayChange}
              />
            </Grid>
            
            {/* Additional Details */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content Tags (comma separated)"
                name="contentTags"
                value={formData.contentTags.join(', ')}
                onChange={handleArrayChange}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {formData.contentTags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small"
                    onDelete={() => {
                      const newTags = [...formData.contentTags];
                      newTags.splice(index, 1);
                      setFormData({ ...formData, contentTags: newTags });
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maturity Rating"
                name="maturityRating"
                value={formData.maturityRating}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Additional Images (comma separated URLs)"
                name="additionalImages"
                value={formData.additionalImages.join(', ')}
                onChange={handleArrayChange}
              />
            </Grid>
            
            {/* Featured Flags */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Promotion Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.featured}
                        onChange={handleSwitchChange}
                        name="featured"
                        color="primary"
                      />
                    }
                    label="Featured"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.trending}
                        onChange={handleSwitchChange}
                        name="trending"
                        color="primary"
                      />
                    }
                    label="Trending"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.newRelease}
                        onChange={handleSwitchChange}
                        name="newRelease"
                        color="primary"
                      />
                    }
                    label="New Release"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.popularInIsrael}
                        onChange={handleSwitchChange}
                        name="popularInIsrael"
                        color="primary"
                      />
                    }
                    label="Popular in Israel"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Media'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminMediaInsert;
