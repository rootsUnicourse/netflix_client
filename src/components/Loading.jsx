import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading content...' }) => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                width: '100%',
                color: 'white'
            }}
        >
            <CircularProgress 
                size={50} 
                thickness={4} 
                sx={{ 
                    color: 'red',
                    mb: 2
                }} 
            />
            <Typography variant="body1" color="white">
                {message}
            </Typography>
        </Box>
    );
};

export default Loading; 