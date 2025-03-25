import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreInfo from './MoreInfo';
import { getActionMedia, getMediaById } from '../api/api';

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

const ActionMedia = ({ mediaType }) => {
  const [actionMedia, setActionMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaDetailsLoading, setMediaDetailsLoading] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    fetchActionMedia();
  }, [mediaType]);

  const fetchActionMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching action media from database with mediaType: ${mediaType || 'all'}`);
      
      // Get action movies/shows directly from our database using genres field
      const response = await getActionMedia(20); // Increase limit to ensure we have enough after filtering
      
      console.log('Action media response:', response);
      
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        let mediaData = response.data.results;
        
        // Filter by mediaType if provided
        if (mediaType) {
          mediaData = mediaData.filter(item => item.type === mediaType);
        }
        
        console.log(`Action ${mediaType || ''} media found:`, mediaData.length);
        
        if (mediaData.length > 0) {
          setActionMedia(mediaData);
        } else {
          if (mediaType === 'tv') {
            setError(`No action TV shows found. Please try refreshing the page.`);
          } else {
            setError(`No action ${mediaType || ''} media found in the database`);
          }
        }
      } else {
        setError('Unexpected response format from action media API');
      }
      
      setLoading(false);
      
      // Check if we can scroll right after content is loaded
      setTimeout(checkScrollability, 100);
    } catch (error) {
      console.error('Error fetching action media:', error);
      setError(error.message || 'Failed to load action content');
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

  // Handle scroll event to update scroll position
  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollRight(scrollWidth > clientWidth + scrollLeft);
    }
  };

  const handleShowClick = async (media) => {
    try {
      // Set loading state for media details
      setMediaDetailsLoading(true);
      
      console.log('Media clicked:', media);
      
      // Fetch full media details
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

  return (
    <Box sx={{ 
      mt: 4,
      mb: 4,
      px: 4,
      position: 'relative',
      color: 'white',
      zIndex: 1,
      '&:hover .scroll-button': {
        opacity: 1,
      }
    }}>
      {/* Row Title */}
      <Typography variant="h5" sx={{ 
        fontWeight: 'bold', 
        mb: 2,
        fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' }
      }}>
        {mediaType === 'movie' 
          ? 'Action Movies' 
          : mediaType === 'tv' 
            ? 'Action TV Shows' 
            : 'Action Movies & TV Shows'}
      </Typography>
      
      {/* Scroll Buttons */}
      <Box sx={{ position: 'relative' }}>
        {scrollPosition > 0 && (
          <IconButton 
            className="scroll-button"
            onClick={handleScrollLeft}
            sx={{ 
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              opacity: { xs: 1, md: 0 },
              transition: 'opacity 0.2s',
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
        
        {canScrollRight && (
          <IconButton 
            className="scroll-button"
            onClick={handleScrollRight}
            sx={{ 
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              opacity: { xs: 1, md: 0 },
              transition: 'opacity 0.2s',
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
        
        {/* Content Row */}
        <Box
          ref={rowRef}
          onScroll={handleScroll}
          sx={{
            display: 'flex',
            overflowX: 'hidden',
            gap: 2,
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
          ) : actionMedia.length === 0 ? (
            // No action media found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              No action movies or TV shows found. Please try again later.
            </Typography>
          ) : (
            // Actual content
            actionMedia.map((media) => (
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
                  src={getImagePath(media.backdropPath || media.posterPath)}
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

export default ActionMedia; 