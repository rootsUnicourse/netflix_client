import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import MoreInfo from './MoreInfo';
import ApiService from '../api/api';

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

const AnimationMedia = ({ mediaType }) => {
  const [animationMedia, setAnimationMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaDetailsLoading, setMediaDetailsLoading] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    fetchAnimationMedia();
  }, [mediaType]);

  const fetchAnimationMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all media first
      const response = await ApiService.getMedia({
        limit: 100 // Get more to filter through
      });
      
      if (!response.data || !response.data.results) {
        console.error('Unexpected response format:', response);
        setError('Could not fetch animation media');
        setLoading(false);
        return;
      }
      
      // Filter for only animation genre
      let animationContent = response.data.results.filter(item => {
        // Check if genres array exists and contains 'Animation'
        return item.genres && 
               Array.isArray(item.genres) && 
               item.genres.some(genre => genre === 'Animation');
      });
      
      console.log(`Found ${animationContent.length} animation items from genre filtering`);
      
      // If mediaType is specified, filter by that too
      if (mediaType) {
        animationContent = animationContent.filter(item => item.type === mediaType);
        console.log(`Filtered to ${animationContent.length} ${mediaType} animation items`);
      }
      
      // If not enough items found, try a more direct API call specifically for animation genre
      if (animationContent.length < 10) {
        try {
          console.log('Not enough animation content, trying direct genre query');
          const genreResponse = await ApiService.getMedia({
            genres: 'Animation', // Directly specify Animation genre
            limit: 30,
            type: mediaType || undefined
          });
          
          if (genreResponse.data && genreResponse.data.results && genreResponse.data.results.length > 0) {
            // Add only new items that aren't already in animationContent
            const existingIds = new Set(animationContent.map(item => item._id));
            const newItems = genreResponse.data.results.filter(item => !existingIds.has(item._id));
            
            console.log(`Found ${newItems.length} additional animation items from direct query`);
            animationContent = [...animationContent, ...newItems];
          }
        } catch (error) {
          console.warn('Error with direct genre query:', error);
        }
      }
      
      // If we still don't have enough, ensure we have items by duplicating existing ones
      if (animationContent.length < 10 && animationContent.length > 0) {
        const itemsNeeded = 10 - animationContent.length;
        for (let i = 0; i < itemsNeeded; i++) {
          // Duplicate an item from the existing data (cycling through available items)
          const itemToDuplicate = animationContent[i % animationContent.length];
          // Create a shallow copy with a slightly modified id to prevent key conflicts
          const duplicatedItem = {
            ...itemToDuplicate,
            _id: `${itemToDuplicate._id}-dup-${i}`
          };
          animationContent.push(duplicatedItem);
        }
        console.log(`Added ${itemsNeeded} duplicated items to reach 10 total items`);
      }
      
      // Limit to 10 items
      const finalMediaData = animationContent.slice(0, 10);
      console.log('Final animation media count:', finalMediaData.length);
      
      setAnimationMedia(finalMediaData);
      setLoading(false);
      
      // Check if we can scroll right after content is loaded
      setTimeout(checkScrollability, 100);
    } catch (error) {
      console.error('Error fetching animation media:', error);
      setError(error.message || 'Failed to load animation content');
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
      const response = await ApiService.getMediaById(media._id);
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

  return (
    <Box sx={{ mt: 4, px: 4, position: 'relative' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        Animation
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
            <ChevronLeft fontSize="large" />
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
            <ChevronRight fontSize="large" />
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
          ) : animationMedia.length === 0 ? (
            // No animation media found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              No animation content found. Check back later!
            </Typography>
          ) : (
            // Actual content
            animationMedia.map((media) => (
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
                  alt={media.title || media.name}
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

export default AnimationMedia; 