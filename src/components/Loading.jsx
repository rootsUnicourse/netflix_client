import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

const Loading = () => {
    // Create a grid of skeleton loaders that match the media card dimensions
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
                {Array.from(new Array(18)).map((_, index) => (
                    <Grid item key={index} xs={6} sm={4} md={3} lg={2.4}>
                        <Box 
                            sx={{ 
                                position: 'relative',
                                height: 0,
                                paddingTop: '56.25%', // 16:9 aspect ratio
                                overflow: 'hidden',
                                borderRadius: '4px',
                                margin: '5px',
                            }}
                        >
                            <Skeleton
                                variant="rectangular"
                                animation="wave"
                                sx={{ 
                                    bgcolor: '#333', 
                                    borderRadius: '4px',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Loading; 