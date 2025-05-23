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

        // Make sure we process media objects correctly
        const processedShows = response.data.results.map(show => {
          // Check if this is a TMDB ID
          if (typeof show._id === 'string' && show._id.startsWith('tmdb-')) {
            // Already in correct format
            return show;
          }
          
          // Check if this has a tmdbId field
          if (show.tmdbId) {
            // Ensure the _id field is in the right format for TMDB media
            return {
              ...show,
              _id: `tmdb-${show.type || 'movie'}-${show.tmdbId}`
            };
          }
          
          // Regular DB media
          return show;
        });

        console.log('Processed top shows:', processedShows);
        setTopShows(processedShows);
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
    // Ensure media has the correct ID format before passing to MoreInfo
    let mediaToShow = { ...media };
    
    // If it has a tmdbId but the _id is not in the right format, fix it
    if (media.tmdbId && !media._id.startsWith('tmdb-')) {
      mediaToShow._id = `tmdb-${media.type || 'movie'}-${media.tmdbId}`;
    }
    
    console.log('Showing media details:', mediaToShow);
    setSelectedMedia(mediaToShow);
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
    <Box sx={{ mt: 4, px: 4, position: 'relative' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
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
              <Box key={index} sx={{ position: 'relative', minWidth: '120px', height: '200px' }}>
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={200}
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
                  minWidth: '120px',
                  height: '200px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 1
                  },
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: index === 9 ? '100px' : '60px'
                }}
                onClick={() => handleShowClick(show)}
              >
                {/* Ranking Number */}
                {index < 9 ? (
                  <Typography
                    variant="h1"
                    sx={{
                      position: 'absolute',
                      left: '-70px',
                      fontSize: '180px',
                      fontWeight: 'bold',
                      color: '#141414',
                      opacity: 0.8,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      zIndex: 0,
                      WebkitTextStroke: '3px #777',
                      fontFamily: 'Arial, sans-serif',
                      lineHeight: '0.8',
                      marginTop: '-10px'
                    }}
                  >
                    {index + 1}
                  </Typography>
                ) : (
                  // Special styling for number 10
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '-125px',
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 0
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: '180px',
                        fontWeight: 'bold',
                        color: '#141414',
                        opacity: 0.8,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        WebkitTextStroke: '3px #777',
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '0.8',
                        marginTop: '-10px'
                      }}
                    >
                      1
                    </Typography>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: '180px',
                        fontWeight: 'bold',
                        color: '#141414',
                        opacity: 0.8,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        WebkitTextStroke: '3px #777',
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '0.8',
                        marginTop: '-10px',
                        marginLeft: '-20px'
                      }}
                    >
                      0
                    </Typography>
                  </Box>
                )}

                {/* Poster Image */}
                <Box
                  component="img"
                  src={show.posterPath || show.backdropPath}
                  alt={show.title}
                  sx={{
                    width: '120px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                  }}
                />
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