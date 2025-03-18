import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Skeleton, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import MoreInfo from './MoreInfo';
import { getTopRatedMedia, getMediaById } from '../api/api';

// Helper function to ensure image URLs are properly formatted
const getImagePath = (path) => {
  if (!path) return 'https://via.placeholder.com/200x120?text=No+Image';
  
  // If the path is already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a TMDB path, add the base URL
  if (path.startsWith('/')) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
  
  // Otherwise, return as is (might be a relative path to our own server)
  return path;
};

// Helper function to safely get rating values from media object with various structures
const getRatingData = (media) => {
  // Try to find the rating value in various possible locations
  const ratingValue = 
    media.averageRating || 
    (media.userRating && media.userRating.average) || 
    0;
  
  // Try to find the review count in various possible locations  
  const reviewCount = 
    media.totalReviews || 
    (media.userRating && media.userRating.count) || 
    0;
    
  return {
    ratingValue: parseFloat(ratingValue).toFixed(1),
    reviewCount
  };
};

const TopRatedMedia = () => {
  const [topRatedMedia, setTopRatedMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaDetailsLoading, setMediaDetailsLoading] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    fetchTopRatedMedia();
  }, []);

  const fetchTopRatedMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching top rated media...');
      const response = await getTopRatedMedia(15); // Fetch top 15 rated media
      
      console.log('Top rated media response:', response);
      console.log('Top rated media response data:', response.data);
      
      // Check for different response formats
      let mediaData = [];
      if (response.data?.results && Array.isArray(response.data.results)) {
        // Handle {results: [...]} format
        console.log('Found results array in response data');
        mediaData = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Handle direct array format
        console.log('Response data is directly an array');
        mediaData = response.data;
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected data format received');
        setLoading(false);
        return;
      }
      
      console.log('Processed media data:', mediaData);
      console.log('Media data length:', mediaData.length);
      
      setTopRatedMedia(mediaData);
      setLoading(false);
      
      // Check if we can scroll right after content is loaded
      setTimeout(checkScrollability, 100);
    } catch (error) {
      console.error('Error fetching top rated media:', error);
      setError(error.message || 'Failed to load top rated content');
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
      
      console.log('Fetching full media details for:', media._id);
      
      // Fetch full media details
      const response = await getMediaById(media._id);
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

  // Helper function to ensure image URLs are properly formatted
  return (
    <Box sx={{ mt: 4, px: 4, position: 'relative' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        Top Rated by Viewers
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
          ) : topRatedMedia.length === 0 ? (
            // No top rated media found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              No highly rated shows or movies found yet. Be the first to rate content!
            </Typography>
          ) : (
            // Actual content
            topRatedMedia.map((media) => (
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
                  src={getImagePath(media.posterPath || media.backdropPath)}
                  alt={media.title}
                  sx={{ 
                    width: '200px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                
                {/* Media Type Badge */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    py: 0.5,
                    px: 1,
                    borderBottomLeftRadius: '4px'
                  }}
                >
                  {media.type === 'movie' ? 'Movie' : 'TV Show'}
                </Box>

                {/* Rating Badge */}
                <Tooltip title={`${getRatingData(media).ratingValue} stars (${getRatingData(media).reviewCount} reviews)`}>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: '#FFD700',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      py: 0.5,
                      px: 1,
                      borderTopRightRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    {getRatingData(media).ratingValue}
                  </Box>
                </Tooltip>
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

export default TopRatedMedia; 