import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, Skeleton, IconButton, Button } from '@mui/material';
import MoreInfo from './MoreInfo';
import ApiService, { getUserReviews, getMediaById } from '../api/api';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const UserReviews = ({ mediaType }) => {
  const [userReviewedMedia, setUserReviewedMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaDetailsLoading, setMediaDetailsLoading] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);
  const { user, currentProfile } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch reviews if user is logged in and has a profile selected
    if (user && currentProfile) {
      fetchUserReviewedMedia();
    } else {
      setLoading(false);
    }
  }, [user, currentProfile, mediaType]);

  const fetchUserReviewedMedia = async () => {
    if (!currentProfile) {
      console.error('No profile selected, cannot fetch reviews');
      setError('Please select a profile to view your reviews');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getUserReviews(currentProfile._id);
      
      console.log('User reviews response for profile', currentProfile.name, ':', response.data);
      
      // Check if we have data and results
      if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected data format received');
        setLoading(false);
        return;
      }
      
      // Make sure we handle reviews that have null or undefined media
      let reviewedMedia = response.data.results
        .filter(review => review && review.media) // Filter out reviews with no media
        .map(review => review.media);
      
      // Filter by mediaType if provided
      if (mediaType) {
        reviewedMedia = reviewedMedia.filter(media => media.type === mediaType);
      }
      
      console.log(`Extracted ${mediaType || 'all'} media from reviews for profile ${currentProfile.name}:`, reviewedMedia);
      
      setUserReviewedMedia(reviewedMedia);
      setLoading(false);
      
      // Check if we can scroll right after content is loaded
      setTimeout(checkScrollability, 100);
    } catch (error) {
      console.error('Error fetching user reviewed media:', error);
      setError(error.message || 'Failed to load your reviews');
      setLoading(false);
    }
  };

  // Check if we can scroll right
  const checkScrollability = () => {
    if (rowRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = rowRef.current;
      setCanScrollRight(scrollWidth > clientWidth + scrollLeft);
    }
  };

  const handleShowClick = async (media) => {
    try {
      // Set loading state for media details
      setMediaDetailsLoading(true);
      
      // Remove any suffix that might have been added (like -featured or -trending)
      const cleanId = media._id.split('-')[0];
      console.log('Fetching full media details for:', cleanId);
      
      // Fetch full media details
      const response = await getMediaById(cleanId);
      const fullMediaData = response.data;
      
      console.log('Full media details received:', fullMediaData);
      
      // Set the selected media with full details and open modal
      setSelectedMedia(fullMediaData);
      setMoreInfoOpen(true);
      setMediaDetailsLoading(false);
    } catch (error) {
      console.error('Error fetching full media details:', error);
      // If there's an error, just use the basic media data we already have
      setSelectedMedia(media);
      setMoreInfoOpen(true);
      setMediaDetailsLoading(false);
    }
  };

  const handleMoreInfoClose = () => {
    setMoreInfoOpen(false);
  };

  const handleScrollLeft = () => {
    if (rowRef.current) {
      const newPosition = Math.max(0, scrollPosition - 800);
      rowRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handleScrollRight = () => {
    if (rowRef.current) {
      const newPosition = scrollPosition + 800;
      rowRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // Handle scroll events to update scroll position state
  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = rowRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollRight(scrollWidth > clientWidth + scrollLeft);
    }
  };

  // If user is not logged in, don't show this section
  if (!user) {
    return null;
  }

  return (
    <Box sx={{ mt: 4, px: 4, position: 'relative' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        Your Reviews
      </Typography>

      <Box sx={{ position: 'relative' }}>
        {/* Left Arrow */}
        {scrollPosition > 0 && (
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <IconButton
            onClick={handleScrollRight}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        )}

        {/* Content Row */}
        <Box
          ref={rowRef}
          onScroll={handleScroll}
          sx={{
            display: 'flex',
            overflowX: 'hidden',
            gap: 4,
            pb: 2,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {loading ? (
            // Skeleton loaders while content is loading
            Array.from(new Array(10)).map((_, index) => (
              <Box key={index} sx={{ position: 'relative', minWidth: '200px', height: '120px' }}>
                <Skeleton
                  variant="rectangular"
                  width={200}
                  height={120}
                  animation="wave"
                  sx={{ bgcolor: '#333', borderRadius: '4px' }}
                />
              </Box>
            ))
          ) : error ? (
            // Show error message
            <Typography sx={{ color: '#ff5252', fontStyle: 'italic', py: 4 }}>
              {error}
            </Typography>
          ) : userReviewedMedia.length === 0 ? (
            // No reviews found
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{ color: '#777', fontStyle: 'italic', mb: 2 }}>
                You haven't reviewed any shows yet. Start watching and share your thoughts!
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/home')}
                sx={{ 
                  bgcolor: '#E50914', 
                  '&:hover': { bgcolor: '#B20710' } 
                }}
              >
                Explore Content
              </Button>
            </Box>
          ) : (
            // Actual content
            userReviewedMedia.map((media) => (
              <Box 
                key={media._id} 
                sx={{ 
                  position: 'relative',
                  minWidth: '200px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 1
                  },
                  opacity: mediaDetailsLoading ? 0.7 : 1,
                }}
                onClick={() => handleShowClick(media)}
              >
                <Box 
                  component="img"
                  src={media.backdropPath || media.posterPath}
                  alt={media.title}
                  sx={{ 
                    width: '200px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            ))
          )}
        </Box>
      </Box>
      
      {/* MoreInfo Dialog */}
      {selectedMedia && (
        <MoreInfo
          open={moreInfoOpen}
          onClose={handleMoreInfoClose}
          media={selectedMedia}
        />
      )}
    </Box>
  );
};

export default UserReviews; 