import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';
import MoreInfo from './MoreInfo';
import { getTopShowsInIsrael } from '../api/api';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const TopShowsInIsrael = () => {
  const [topShows, setTopShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchTopShows = async () => {
      try {
        setLoading(true);
        const response = await getTopShowsInIsrael(10);
        
        setTopShows(response.data.results);
        setLoading(false);
        
        // Check if we can scroll right after content is loaded
        setTimeout(checkScrollability, 100);
      } catch (error) {
        console.error('Error fetching top shows in Israel:', error);
        setLoading(false);
      }
    };

    fetchTopShows();
  }, []);

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
        Top 10 in Israel Today
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
          ) : topShows.length === 0 ? (
            // No top shows found
            <Typography sx={{ color: '#777', fontStyle: 'italic', py: 4 }}>
              No top shows found. Check back later!
            </Typography>
          ) : (
            // Actual content
            topShows.map((show, index) => (
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
                
                {/* Top 10 Ranking Badge */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    py: 0.5,
                    px: 1,
                    borderBottomRightRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#E50914', 
                      fontWeight: 'bold'
                    }}
                  >
                    #{index + 1}
                  </Typography>
                </Box>

                {/* Show Season Info - Only for TV shows with multiple seasons */}
                {show.seasons > 1 && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      py: 0.5,
                      px: 1,
                      borderTopLeftRadius: '4px'
                    }}
                  >
                    {show.seasons} Seasons
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

export default TopShowsInIsrael; 