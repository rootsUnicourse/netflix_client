import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Skeleton } from '@mui/material';
import MoreInfo from './MoreInfo';
import ApiService, { getNewReleases } from '../api/api';

const NewOnNetflix = () => {
  const [newShows, setNewShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  useEffect(() => {
    const fetchNewShows = async () => {
      try {
        setLoading(true);
        const response = await getNewReleases(10);
        console.log(response.data.results);
        
        setNewShows(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching new shows:', error);
        setLoading(false);
      }
    };

    fetchNewShows();
  }, []);

  const handleShowClick = (media) => {
    setSelectedMedia(media);
    setMoreInfoOpen(true);
  };

  const handleMoreInfoClose = () => {
    setMoreInfoOpen(false);
  };

  return (
    <Box sx={{ mt: 4, mb: 4, px: 4 }}>
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

      <Box 
        sx={{ 
          display: 'flex', 
          overflowX: 'auto',
          gap: 2,
          pb: 2,
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#111',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#555',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#777',
          },
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
                src={show.posterPath}
                alt={show.title}
                sx={{ 
                  width: '200px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              
              {/* Badge for Recently Added or Leaving Soon */}
              {show.newRelease && (
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
                  Recently Added
                </Box>
              )}
              
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
            </Box>
          ))
        )}
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