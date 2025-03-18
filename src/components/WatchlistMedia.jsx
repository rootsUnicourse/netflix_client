import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
} from '@mui/material';
import MoreInfo from './MoreInfo';
import UserContext from '../context/UserContext';

const WatchlistMedia = ({ mediaType }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  const { watchlist } = useContext(UserContext);
  
  // Filter the watchlist by mediaType if provided
  const filteredWatchlist = mediaType 
    ? watchlist?.filter(item => item.type === mediaType) 
    : watchlist;

  const handleInfoClick = (media) => {
    setSelectedMedia(media);
    setMoreInfoOpen(true);
  };

  const handleCloseMoreInfo = () => {
    setMoreInfoOpen(false);
  };

  // If no items in watchlist
  if (!filteredWatchlist || filteredWatchlist.length === 0) {
    return (
      <Box sx={{ my: 4, px: 4 }}>
        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
          My List {mediaType === 'tv' ? '(TV Shows)' : mediaType === 'movie' ? '(Movies)' : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#aaa' }}>
          {watchlist && watchlist.length > 0 
            ? `You don't have any ${mediaType === 'tv' ? 'TV shows' : 'movies'} in your list yet.`
            : "You haven't added any titles to your list yet."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4, px: 4 }}>
      <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
        My List {mediaType === 'tv' ? '(TV Shows)' : mediaType === 'movie' ? '(Movies)' : ''}
      </Typography>

      <Box sx={{ position: 'relative', overflowX: 'hidden' }}>
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', pl: 0.5, pb: 2 }}>
          {filteredWatchlist.map((media) => (
            <Box
              key={media._id}
              sx={{
                flexShrink: 0,
                width: { xs: '40%', sm: '30%', md: '20%', lg: '16%' },
                mr: 1,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                  zIndex: 1,
                  transition: 'transform 0.3s ease-in-out',
                },
              }}
              onClick={() => handleInfoClick(media)}
            >
              <Box
                component="img"
                src={media.backdropPath || media.posterPath || 'https://via.placeholder.com/300x169?text=No+Image'}
                alt={media.title}
                sx={{
                  width: '200px',
                  height: '120px',
                  borderRadius: '4px',
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* More Info Dialog */}
      {selectedMedia && (
        <MoreInfo
          open={moreInfoOpen}
          onClose={handleCloseMoreInfo}
          media={selectedMedia}
        />
      )}
    </Box>
  );
};

export default WatchlistMedia; 