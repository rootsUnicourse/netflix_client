import React, { useState, useEffect, useContext } from 'react';
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
  Divider,
  Pagination,
  Avatar,
  Chip,
  Dialog,
  DialogContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ApiService, { createReview, getMediaReviews, updateReview } from '../api/api';
import UserContext from '../context/UserContext';

const Review = ({ open, onClose, mediaIdProp }) => {
  const { mediaId: mediaIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  // Use the mediaId from props if provided, otherwise use from URL params
  const mediaId = mediaIdProp || mediaIdParam;
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({
    rating: 0,
    content: '',
    isPublic: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userReview, setUserReview] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Reset all the state when the mediaId changes or the modal opens/closes
  useEffect(() => {
    if (open || (!open && !onClose)) { // Execute if it's a modal and open, or if it's a regular page
      setLoading(true);
      setReview({
        rating: 0,
        content: '',
        isPublic: true
      });
      setUserReview(null);
      setError('');
      setSuccess('');
    }
  }, [mediaId, open]);

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

    if (mediaId && (open || (!open && !onClose))) {
      fetchMedia();
    }
  }, [mediaId, open]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!mediaId) return;
        
        const cleanId = mediaId.split('-')[0];
        const response = await getMediaReviews(cleanId, page);
        
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        
        // Check if user has already reviewed this media
        const currentProfile = localStorage.getItem('currentProfile');
        const profileData = currentProfile ? JSON.parse(currentProfile) : null;
        const profileId = profileData?._id;
        
        if (profileId) {
          const userReview = response.data.reviews.find(
            r => r.profile?._id === profileId
          );
          
          if (userReview) {
            setUserReview(userReview);
            setReview({
              rating: userReview.rating,
              content: userReview.content,
              isPublic: userReview.isPublic
            });
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      }
    };

    if (mediaId && (open || (!open && !onClose))) {
      fetchReviews();
    }
  }, [mediaId, page, user?.userId, open]);

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

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to submit a review');
      return;
    }

    if (!review.content.trim()) {
      setError('Please enter your review');
      return;
    }

    if (!review.rating) {
      setError('Please provide a rating');
      return;
    }

    try {
      const currentProfile = localStorage.getItem('currentProfile');
      const profileData = currentProfile ? JSON.parse(currentProfile) : null;
      const profileId = profileData?._id;
      
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
        mediaId: cleanId,
        profileId: profileId,
        rating: review.rating,
        content: review.content.trim(),
        isPublic: review.isPublic
      };
      
      console.log('Review data being submitted:', reviewData);
      
      // Validate required fields
      if (!reviewData.mediaId || !reviewData.content) {
        console.error('Missing required fields:', { 
          hasMediaId: !!reviewData.mediaId, 
          hasContent: !!reviewData.content
        });
        setError('Media ID and content are required');
        return;
      }

      if (userReview) {
        // Update existing review
        await updateReview(userReview._id, reviewData);
      } else {
        // Create new review
        await createReview(reviewData);
      }

      console.log('Review submitted successfully');

      setSuccess('Review submitted successfully!');
      
      // Refresh reviews
      const response = await getMediaReviews(cleanId, page);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      
      // Update user review
      const updatedUserReview = response.data.reviews.find(
        r => r.profile?._id === profileId
      );
      if (updatedUserReview) {
        setUserReview(updatedUserReview);
      }

      // If in dialog mode, close the dialog after successful submission
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/home');
    }
  };

  if (loading) {
    return onClose ? (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#181818',
            color: 'white',
            borderRadius: '8px'
          }
        }}
      >
        <DialogContent>
          <Typography>Loading...</Typography>
        </DialogContent>
      </Dialog>
    ) : (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!media) {
    return onClose ? (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#181818',
            color: 'white',
            borderRadius: '8px'
          }
        }}
      >
        <DialogContent>
          <Typography color="error">Media not found</Typography>
          <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    ) : (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Media not found</Typography>
        <Button variant="contained" onClick={() => navigate('/home')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const content = (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        borderRadius: 2,
        bgcolor: '#181818',
        color: 'white',
        position: 'relative'
      }}
    >
      <IconButton 
        onClick={handleClose} 
        sx={{ 
          color: 'white',
          position: 'absolute',
          top: 10,
          right: 10
        }}
      >
        {onClose ? <CloseIcon /> : <ArrowBackIcon />}
      </IconButton>

      <Grid container spacing={4} sx={{ mt: 1 }}>
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
              {userReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Reviews ({totalReviews})
        </Typography>
        
        {/* Average Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Rating
            value={averageRating}
            precision={0.1}
            readOnly
            size="large"
            sx={{ mr: 2, '& .MuiRating-iconFilled': { color: '#E50914' } }}
          />
          <Typography variant="h6">
            {averageRating.toFixed(1)} / 5 ({totalReviews} reviews)
          </Typography>
        </Box>

        {/* Reviews List */}
        {reviews.map((review) => (
          <Paper
            key={review._id}
            sx={{
              p: 3,
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={review.profile?.avatar || '/default-avatar.png'}
                alt={review.profile?.name || 'User'}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {review.profile?.name || 'Anonymous User'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Rating
              value={review.rating}
              readOnly
              size="small"
              sx={{ mb: 1, '& .MuiRating-iconFilled': { color: '#E50914' } }}
            />

            <Typography variant="body1" sx={{ mb: 2, color: 'white' }}>
              {review.content}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {review.spoiler && (
                <Chip
                  label="Contains Spoilers"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(229,9,20,0.1)',
                    color: '#E50914',
                    border: '1px solid #E50914'
                  }}
                />
              )}
            </Box>
          </Paper>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: '#E50914',
                    '&:hover': {
                      bgcolor: '#B20710'
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );

  return onClose ? (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogContent sx={{ p: 2, bgcolor: 'transparent' }}>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {content}
    </Container>
  );
};

export default Review; 