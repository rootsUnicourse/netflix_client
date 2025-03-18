import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Skeleton, IconButton } from '@mui/material';
import MoreInfo from './MoreInfo';
import ApiService, { getNewReleases } from '../api/api';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const NewOnNetflix = ({ tvOnly }) => {
  const [newShows, setNewShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchNewShows = async () => {
      try {
        setLoading(true);
        // If tvOnly is true, add the type parameter to the request
        const response = await getNewReleases(10, tvOnly ? 'tv' : null);
        
        // If tvOnly is true but the API doesn't support type filtering,
        // filter the results here
        let filteredResults = response.data.results;
        if (tvOnly && !response.config?.params?.type) {
          filteredResults = filteredResults.filter(show => show.type === 'tv');
        }
        
        setNewShows(filteredResults);
        setLoading(false);
        
        // Check if we can scroll right after content is loaded
        setTimeout(checkScrollability, 100);
      } catch (error) {
        console.error('Error fetching new shows:', error);
        setLoading(false);
      }
    };

    fetchNewShows();
  }, [tvOnly]);

  // Check if we can scroll right
  const checkScrollability = () => {
    if (rowRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = rowRef.current;
      setCanScrollRight(scrollWidth > clientWidth + scrollLeft);
    }
  };

  const handleShowClick = (media) => {
    setSelectedMedia(media);
    setMoreInfoOpen(true);
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
    <Box sx={{ mt: 4, mb: 4, px: 4, position: 'relative' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 2, 
          color: 'white' 
        }}
      >
        New on Netflix
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
              <Box key={index} sx={{ position: 'relative', minWidth: '200px' }}>
                <Skeleton 
                  variant="rectangular" 
                  width={200} 
                  height={120} 
                  animation="wave" 
                  sx={{ bgcolor: '#333', borderRadius: '4px' }} 
                />
              </Box>
            ))
          ) : newShows.length === 0 ? (
            // No new releases found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              No new releases found. Check back later!
            </Typography>
          ) : (
            // Actual content
            newShows.map((show) => (
              <Box 
                key={show._id} 
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
      <MoreInfo 
        open={moreInfoOpen} 
        onClose={handleMoreInfoClose} 
        media={selectedMedia} 
      />
    </Box>
  );
};

export default NewOnNetflix; 