import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  FormControlLabel,
  Switch,
  Paper,
  Container,
  Grid,
  IconButton,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ApiService, { createReview } from '../api/api';

const Review = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({
    rating: 0,
    content: '',
    isPublic: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        console.log('Fetching media with ID:', mediaId);
        
        // Make sure we have a valid ID
        if (!mediaId) {
          console.error('Invalid media ID');
          setError('Invalid media ID');
          setLoading(false);
          return;
        }
        
        // Remove any suffix that might have been added (like -featured or -trending)
        const cleanId = mediaId.split('-')[0];
        console.log('Using clean ID for fetching:', cleanId);
        
        const response = await ApiService.getMediaById(cleanId);
        console.log('Media data received:', response.data);
        setMedia(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media details. Please try again later.');
        setLoading(false);
      }
    };

    fetchMedia();
  }, [mediaId]);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setReview({
      ...review,
      [name]: name === 'isPublic' ? checked : value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setReview({
      ...review,
      rating: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!review.content.trim()) {
      setError('Please enter your review');
      return;
    }

    try {
      const profileId = localStorage.getItem('currentProfileId');
      
      if (!profileId) {
        setError('You must be logged in with a profile to submit a review');
        return;
      }

      // Make sure we have a valid ID
      if (!mediaId) {
        setError('Invalid media ID');
        return;
      }
      
      // Remove any suffix that might have been added (like -featured or -trending)
      const cleanId = mediaId.split('-')[0];
      console.log('Using clean ID for review submission:', cleanId);

      const reviewData = {
        ...review,
        media: cleanId,
        profile: profileId
      };
      
      console.log('Submitting review:', reviewData);
      await createReview(reviewData);
      console.log('Review submitted successfully');

      setSuccess('Review submitted successfully!');
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!media) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Media not found</Typography>
        <Button variant="contained" onClick={() => navigate('/home')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          bgcolor: '#181818',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/home')} 
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Review: {media.title}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={media.posterPath}
              alt={media.title}
              sx={{
                width: '100%',
                borderRadius: 1,
                mb: 2
              }}
            />
            <Typography variant="h6" gutterBottom>
              {media.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: '#aaa' }}>
              {media.type === 'movie' ? 'Movie' : 'TV Series'} • {new Date(media.releaseDate).getFullYear()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Your Rating
              </Typography>
              <Rating
                name="rating"
                value={review.rating}
                onChange={handleRatingChange}
                size="large"
                sx={{ mb: 3, '& .MuiRating-iconFilled': { color: '#E50914' } }}
              />

              <Typography variant="h6" gutterBottom>
                Your Review
              </Typography>
              <TextField
                name="content"
                value={review.content}
                onChange={handleInputChange}
                multiline
                rows={6}
                fullWidth
                placeholder="Share your thoughts about this title..."
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#E50914' },
                  },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={review.isPublic}
                    onChange={handleInputChange}
                    name="isPublic"
                    color="primary"
                  />
                }
                label="Make this review public"
                sx={{ mb: 3 }}
              />

              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              {success && (
                <Typography color="primary" sx={{ mb: 2 }}>
                  {success}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ 
                  bgcolor: '#E50914',
                  '&:hover': { bgcolor: '#B20710' },
                  px: 4
                }}
              >
                Submit Review
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Review; 