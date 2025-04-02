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
  Pagination,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ApiService, { createReview, getMediaReviews, updateReview } from '../api/api';
import UserContext from '../context/UserContext';
import StarIcon from '@mui/icons-material/Star';
import eventBus, { EVENTS } from '../services/EventBusService';

const Review = ({ open, onClose, mediaIdProp }) => {
  const { mediaId: mediaIdParam } = useParams();
  const navigate = useNavigate();
  const { profiles, user } = useContext(UserContext);
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
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    // Get fresh user data with role information
    const userData = localStorage.getItem('user');
    let userFromStorage = null;
    
    if (userData) {
      try {
        userFromStorage = JSON.parse(userData);
      } catch (err) {
        console.error('Error parsing user data from localStorage:', err);
      }
    }
    
    // Use either context user or localStorage user
    const currentUser = user || userFromStorage;
    
    if (currentUser) {
      
      if (currentUser.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Get current profile on component mount
  useEffect(() => {
    // First try sessionStorage (current implementation)
    let profileData = sessionStorage.getItem('currentProfile');
    
    // If not found in sessionStorage, try localStorage (backward compatibility)
    if (!profileData) {
      profileData = localStorage.getItem('currentProfile');
    }
    
    
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        setCurrentProfile(parsed);
      } catch (err) {
        console.error('Error parsing profile data:', err);
      }
    } else {
      console.error('No profile found in sessionStorage or localStorage');
      // If no profile in storage but profiles are available from context, use the first one
      if (profiles && profiles.length > 0) {
        setCurrentProfile(profiles[0]);
        sessionStorage.setItem('currentProfile', JSON.stringify(profiles[0]));
      }
    }
  }, [profiles]);

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
  }, [mediaId, open, onClose]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        
        // Make sure we have a valid ID
        if (!mediaId) {
          console.error('Invalid media ID');
          setError('Invalid media ID');
          setLoading(false);
          return;
        }
        
        // Check if this is a TMDB ID (in format tmdb-type-id)
        if (mediaId.startsWith('tmdb-')) {
          // For TMDB IDs, we don't need to fetch the media as we'll have all details in the MoreInfo component
          // Just create a placeholder media object with necessary info
          const parts = mediaId.split('-');
          if (parts.length >= 3) {
            const mediaType = parts[1];
            const tmdbId = parts[2];
            
            try {
              // Fetch basic details from TMDB
              const response = await ApiService.getTMDBDetails(mediaType, tmdbId);
              
              if (response.data) {
                setMedia({
                  ...response.data,
                  _id: mediaId, // Keep the original ID format for consistency
                  tmdbId: tmdbId,
                  type: mediaType
                });
                setLoading(false);
                return;
              }
            } catch (tmdbErr) {
              console.error('Error fetching TMDB details:', tmdbErr);
              // Continue to fallback method
            }
          }
        }
        
        // Regular database media - remove any suffix that might have been added (like -featured or -trending)
        const cleanId = mediaId.split('-')[0];
        
        const response = await ApiService.getMediaById(cleanId);
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
  }, [mediaId, open, onClose]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!mediaId) return;
        
        // For TMDB IDs, we need to extract the actual ID for the database
        let effectiveId;
        if (mediaId.startsWith('tmdb-')) {
          // We'll use the full TMDB ID format as the review key
          effectiveId = mediaId;
        } else {
          // Remove any suffix that might have been added (like -featured or -trending)
          effectiveId = mediaId.split('-')[0];
        }
        
        // Pass includeNonPublic='true' as a string if the user is an admin
        const includeNonPublicValue = isAdmin ? 'true' : 'false';
        
        const response = await getMediaReviews(effectiveId, page, 10, includeNonPublicValue);
        
        
        // Check if we got the expected private review
        const hasPrivateReviews = response.data.reviews.some(r => r.isPublic === false);
        
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        
        // Get current profile from state
        if (currentProfile?._id) {
          const userReview = response.data.reviews.find(
            r => r.profile?._id === currentProfile._id
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
        
        // If admin but no private reviews found, try forcing the admin flag
        if (isAdmin && !hasPrivateReviews) {
          // Force admin mode by directly specifying 'true' string
          const retryResponse = await getMediaReviews(effectiveId, page, 10, 'true');
          
          if (retryResponse.data.reviews.some(r => r.isPublic === false)) {
            setReviews(retryResponse.data.reviews);
            setTotalPages(retryResponse.data.totalPages);
            setAverageRating(retryResponse.data.averageRating);
            setTotalReviews(retryResponse.data.totalReviews);
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
  }, [mediaId, page, currentProfile, open, onClose, isAdmin]);

  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      // Reset review state to default
      setReview({
        rating: 0,
        content: '',
        isPublic: true
      });
      
      setError('');
      setSuccess('');
    }
  }, [open]);

  // Set initial values if editing an existing review
  useEffect(() => {
    if (userReview && open) {
      setReview({
        rating: userReview.rating,
        content: userReview.content,
        isPublic: userReview.isPublic === undefined ? true : userReview.isPublic,
      });
    }
  }, [userReview, open]);

  // Set success message timeout
  useEffect(() => {
    let timer;
    if (success && onClose) {
      timer = setTimeout(() => {
        onClose();
      }, 1500);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, onClose]);

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
      // Get the profile directly from state
      if (!currentProfile || !currentProfile._id) {
        console.error('No current profile found in state');
        
        // Try getting it directly from session/local storage again
        const sessionProfile = sessionStorage.getItem('currentProfile');
        const localProfile = localStorage.getItem('currentProfile');
        
        
        let profileData = sessionProfile || localProfile;
        
        if (profileData) {
          try {
            const parsed = JSON.parse(profileData);
            setCurrentProfile(parsed);
            
            if (!parsed._id) {
              throw new Error('Invalid profile data - no ID');
            }
            
            // Proceed with the review submission using the refreshed profile
            await submitReview(parsed._id);
            return;
          } catch (parseErr) {
            console.error('Error parsing profile data:', parseErr);
          }
        }
        
        setError('You must be logged in with a profile to submit a review');
        return;
      }
      
      await submitReview(currentProfile._id);
    } catch (err) {
      console.error('Error submitting review:', err);
      
      // First, check if there's a response with data
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to submit review');
      } else if (err.message) {
        // Otherwise, use the error message directly
        setError(err.message);
      } else {
        // Fallback error message
        setError('Failed to submit review. Please try again later.');
      }
    }
  };
  
  // Separate function to handle the actual submission
  const submitReview = async (profileId) => {
    // Make sure we have a valid ID
    if (!mediaId) {
      throw new Error('Invalid media ID');
    }
    
    // For TMDB IDs, use the full ID
    let effectiveId;
    if (mediaId.startsWith('tmdb-')) {
      effectiveId = mediaId;
    } else {
      // Remove any suffix that might have been added (like -featured or -trending)
      effectiveId = mediaId.split('-')[0];
    }

    const reviewData = {
      mediaId: effectiveId,
      profileId: profileId,
      rating: review.rating,
      content: review.content.trim(),
      isPublic: review.isPublic
    };
    
    
    // Validate required fields
    if (!reviewData.mediaId || !reviewData.content) {
      console.error('Missing required fields:', { 
        hasMediaId: !!reviewData.mediaId, 
        hasContent: !!reviewData.content
      });
      throw new Error('Media ID and content are required');
    }

    let response;
    if (userReview) {
      // Update existing review
      response = await updateReview(userReview._id, reviewData);
      
      // Emit event that review was updated
      eventBus.emit(EVENTS.REVIEW_UPDATED, {
        reviewId: userReview._id,
        mediaId: effectiveId,
        profileId: profileId,
        updatedReview: response.data.review
      });
    } else {
      // Create new review
      response = await createReview(reviewData);
      
      // Immediately add the new review to the reviews list to avoid page refresh
      if (response.data && response.data.review) {
        const newReview = {
          ...response.data.review,
          profile: currentProfile, // Add profile information to display correctly
          createdAt: new Date().toISOString()
        };
        
        // Add the new review at the beginning of the list
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        // Update user review
        setUserReview(newReview);
        
        // Update average rating and total reviews
        if (response.data.averageRating !== undefined) {
          setAverageRating(response.data.averageRating);
        }
        if (response.data.totalReviews !== undefined) {
          setTotalReviews(prevTotal => prevTotal + 1);
        }
        
        // Emit event that a new review was created
        eventBus.emit(EVENTS.REVIEW_CREATED, {
          review: newReview,
          media: media,
          profileId: profileId
        });
      }
    }

    setSuccess('Review submitted successfully!');
    
    // Refresh reviews after a short delay to ensure we have the latest data
    setTimeout(async () => {
      try {
        const reviewsResponse = await getMediaReviews(effectiveId, page, 10, isAdmin ? 'true' : 'false');
        setReviews(reviewsResponse.data.reviews);
        setTotalPages(reviewsResponse.data.totalPages);
        setAverageRating(reviewsResponse.data.averageRating);
        setTotalReviews(reviewsResponse.data.totalReviews);
        
        // Update user review
        const updatedUserReview = reviewsResponse.data.reviews.find(
          r => r.profile?._id === profileId
        );
        if (updatedUserReview) {
          setUserReview(updatedUserReview);
        }
      } catch (err) {
        console.error('Error refreshing reviews:', err);
      }
    }, 500);

    // If in dialog mode, close the dialog after successful submission
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
    
    return response;
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
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <CircularProgress color="primary" sx={{ mr: 2 }} />
          <Typography>Loading...</Typography>
        </DialogContent>
      </Dialog>
    ) : (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="primary" sx={{ mr: 2 }} />
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
              precision={0.5}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
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
              borderRadius: 2,
              border: review.isPublic === false ? '1px solid rgba(229,9,20,0.3)' : 'none'
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
              {isAdmin && review.isPublic === false && (
                <Chip
                  label="Private Review"
                  size="small"
                  sx={{
                    ml: 2,
                    bgcolor: 'rgba(229,9,20,0.1)',
                    color: '#E50914',
                    border: '1px solid #E50914'
                  }}
                />
              )}
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
      <DialogTitle sx={{ p: 0, m: 0, display: 'none' }}>
        Review {media?.title}
      </DialogTitle>
      <DialogContent sx={{ p: 2, bgcolor: 'transparent' }}>
        {content}
      </DialogContent>
      <DialogActions sx={{ p: 0, m: 0, display: 'none' }}>
        <Button onClick={onClose} sx={{ display: 'none' }}>Close</Button>
      </DialogActions>
    </Dialog>
  ) : (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {content}
    </Container>
  );
};

export default Review; 