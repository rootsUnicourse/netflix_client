import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreInfo from './MoreInfo';
import UserContext from '../context/UserContext';
import { getMediaById } from '../api/api';
import axios from 'axios';

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

const MatchForYou = ({ mediaType }) => {
  const [matchedMedia, setMatchedMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaDetailsLoading, setMediaDetailsLoading] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);
  const { watchlist } = useContext(UserContext);

  // Fetch media on component mount
  useEffect(() => {
    fetchAndRecommendMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndRecommendMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Fetch all media
      const response = await axios.get(`${apiBaseUrl}/media`, {
        params: { 
          limit: 100,
          type: mediaType || undefined // Filter by mediaType if provided
        }
      });
      
      if (!response.data || !response.data.results) {
        console.error('Unexpected response format:', response);
        setError('Could not fetch media data');
        setLoading(false);
        return;
      }
      
      const allMedia = response.data.results;
      console.log(`Loaded ${allMedia.length} media items for matching`);
      
      // Generate personalized recommendations using a simplified approach
      let recommendedMedia = [];
      
      // If user has watched/liked items, use them for recommendations
      if (watchlist && watchlist.length > 0) {
        // Filter watchlist by mediaType if needed
        const relevantWatchlist = mediaType 
          ? watchlist.filter(item => item.type === mediaType)
          : watchlist;
          
        console.log(`Using ${relevantWatchlist.length} watchlist items to generate recommendations`);
        
        // Get genres from user's watchlist
        const userGenres = new Set();
        relevantWatchlist.forEach(item => {
          if (item.genres && Array.isArray(item.genres)) {
            item.genres.forEach(genre => userGenres.add(genre));
          }
        });
        
        console.log('User genre preferences:', [...userGenres]);
        
        // Find media with matching genres that isn't already in watchlist
        const genreRecommendations = allMedia.filter(media => {
          // Skip if in watchlist
          if (watchlist.some(item => item._id === media._id)) return false;
          
          // Check if media has any genre matching user preferences
          return media.genres && Array.isArray(media.genres) && 
                 media.genres.some(genre => userGenres.has(genre));
        });
        
        console.log(`Found ${genreRecommendations.length} genre-based recommendations`);
        
        // Add genre recommendations limited to 10
        recommendedMedia = genreRecommendations.slice(0, 10);
      }
      
      // If we don't have enough genre recommendations, add popular items
      if (recommendedMedia.length < 10) {
        console.log(`Adding popular content to fill up recommendations`);
        
        const popularMedia = allMedia
          .filter(media => !recommendedMedia.some(rec => rec._id === media._id) && 
                          !watchlist.some(item => item._id === media._id))
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 10 - recommendedMedia.length);
          
        recommendedMedia = [...recommendedMedia, ...popularMedia];
      }
      
      // Shuffle the recommendations for variety
      const shuffledRecommendations = [...recommendedMedia].sort(() => Math.random() - 0.5);
      
      // Limit to exactly 10 recommendations or whatever is available
      const finalRecommendations = shuffledRecommendations.slice(0, 10);
      
      console.log('Generated recommendations:', finalRecommendations.length);
      setMatchedMedia(finalRecommendations);
      setLoading(false);
      
      // Check if we can scroll right after content is loaded
      setTimeout(checkScrollability, 100);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError(error.message || 'Failed to generate personalized recommendations');
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

  return (
    <Box sx={{ mt: 4, px: 4, position: 'relative' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        Match For You
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
          ) : matchedMedia.length === 0 ? (
            // No media found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              Add titles to your watchlist for better recommendations
            </Typography>
          ) : (
            // Actual content
            matchedMedia.map((media) => (
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

export default MatchForYou; 