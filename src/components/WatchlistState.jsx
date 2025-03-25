import React, { useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import UserContext from '../context/UserContext';

// This is a development-only component to help debug watchlist issues
const WatchlistState = () => {
  const { watchlist, currentProfile } = useContext(UserContext);
  
  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 10, 
        right: 10, 
        zIndex: 9999, 
        p: 2, 
        maxWidth: 400,
        maxHeight: 300,
        overflow: 'auto',
        opacity: 0.9,
        backgroundColor: '#333',
        color: 'white'
      }}
    >
      <Typography variant="h6" gutterBottom>Watchlist Debug</Typography>
      <Typography variant="body2">
        Current Profile: {currentProfile ? currentProfile.name : 'None'} 
        (ID: {currentProfile?._id || 'None'})
      </Typography>
      <Typography variant="body2" gutterBottom>
        Watchlist items: {watchlist?.length || 0}
      </Typography>
      
      {watchlist && watchlist.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Watchlist Contents:</Typography>
          {watchlist.map((item, index) => (
            <Box key={index} sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {index + 1}. {item.title || 'Unknown'} (ID: {item._id || 'None'})
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default WatchlistState; 