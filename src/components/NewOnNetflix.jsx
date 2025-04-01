import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Grid, Skeleton, IconButton, CircularProgress } from '@mui/material';
import MoreInfo from './MoreInfo';
import ApiService, { getTMDBNewReleases } from '../api/api';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const NewOnNetflix = ({ tvOnly, mediaType }) => {
  const [newShows, setNewShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchNewShows = async () => {
      try {
        // Reset any previous error
        setError(null);
        setLoading(true);
        
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        // Determine the type of media to fetch
        // mediaType takes precedence if provided, otherwise use tvOnly
        const type = mediaType || (tvOnly ? 'tv' : null);
        
        console.log(`Fetching new ${type || 'all'} releases...`);
        const startTime = Date.now();
        
        const response = await getTMDBNewReleases(10, type);
        
        console.log(`Fetch completed in ${(Date.now() - startTime) / 1000} seconds`);
        
        if (response && response.data && response.data.results) {
          setNewShows(response.data.results);
        } else {
          setNewShows([]);
        }
        
        setLoading(false);
        
        // Check if we can scroll right after content is loaded
        setTimeout(checkScrollability, 100);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching new shows:', error);
        setError('Failed to fetch new releases');
        setLoading(false);
      }
    };

    fetchNewShows();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [tvOnly, mediaType]);

  // Check if we can scroll right
  const checkScrollability = () => {
    if (rowRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = rowRef.current;
      setCanScrollRight(scrollWidth > clientWidth + scrollLeft);
    }
  };

  const handleShowClick = (media) => {
    // Set the full media object which now contains all the details needed by MoreInfo
    setSelectedMedia({
      ...media,
      // Add a flag to indicate this is a complete media object that doesn't need further fetching
      fullDetails: true
    });
    setMoreInfoOpen(true);
  };

  const handleMoreInfoClose = () => {
    setMoreInfoOpen(false);
    // Clear the selected media after closing to free up memory
    setTimeout(() => setSelectedMedia(null), 300);
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

  // Memoize skeletons to reduce re-renders
  const loadingSkeletons = useMemo(() => {
    return Array.from(new Array(10)).map((_, index) => (
      <Box key={index} sx={{ position: 'relative', minWidth: '200px' }}>
        <Skeleton 
          variant="rectangular" 
          width={200} 
          height={120} 
          animation="wave" 
          sx={{ bgcolor: '#333', borderRadius: '4px' }} 
        />
      </Box>
    ));
  }, []);

  return (
    <Box sx={{ mt: 4, mb: 4, px: 4, position: 'relative' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 2, 
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        New on Netflix
        {loading && (
          <CircularProgress 
            size={20} 
            sx={{ ml: 2, color: '#E50914' }} 
          />
        )}
      </Typography>

      {error && (
        <Typography sx={{ color: '#ff6b6b', mb: 2 }}>
          {error}
        </Typography>
      )}

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
            loadingSkeletons
          ) : newShows.length === 0 ? (
            // No new releases found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              No new releases found. Check back later!
            </Typography>
          ) : (
            // Actual content
            newShows.map((show) => (
              <Box 
                key={show.tmdbId || show._id} 
                sx={{ 
                  position: 'relative',
                  minWidth: '200px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 1
                  }
                }}
                onClick={() => handleShowClick(show)}
              >
                <Box 
                  component="img"
                  src={show.backdropPath || show.posterPath}
                  alt={show.title}
                  loading="lazy"
                  sx={{ 
                    width: '200px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                
                {/* Top 10 Badge */}
                {show.trending && (
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
                      borderBottomLeftRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#E50914', 
                        fontWeight: 'bold', 
                        mr: 0.5 
                      }}
                    >
                      TOP
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      10
                    </Typography>
                  </Box>
                )}

                {/* New Season Badge - Only for TV shows with multiple seasons */}
                {show.type === 'tv' && show.seasons > 1 && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      bgcolor: '#E50914',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      py: 0.5,
                      px: 1,
                      borderTopRightRadius: '4px'
                    }}
                  >
                    New Season
                  </Box>
                )}
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

export default NewOnNetflix; 