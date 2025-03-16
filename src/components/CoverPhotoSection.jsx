import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreInfo from './MoreInfo';

const CoverPhotoSection = ({ featuredMediaList = [], featured }) => {
  const [displayedMedia, setDisplayedMedia] = useState(featured);
  const [fadeIn, setFadeIn] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Initialize with provided media list or featured item
  useEffect(() => {
    if (featured) {
      setDisplayedMedia(featured);
    } else if (featuredMediaList && featuredMediaList.length > 0) {
      setDisplayedMedia(featuredMediaList[0]);
    }
  }, [featured, featuredMediaList]);

  // Rotate through featured media every 4 seconds
  useEffect(() => {
    if (!featuredMediaList || featuredMediaList.length <= 1 || featured || moreInfoOpen) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % featuredMediaList.length;
        handleMediaChange(featuredMediaList[newIndex]);
        return newIndex;
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [featuredMediaList, featured, moreInfoOpen]);

  // Handle media change with fade effect
  const handleMediaChange = (newMedia) => {
    if (!newMedia) return;
    
    // Start fade out
    setFadeIn(false);

    // After fade out completes, update the displayed media and start fade in
    setTimeout(() => {
      setDisplayedMedia(newMedia);
      setFadeIn(true);
    }, 300); // This should match the transition duration
  };

  // Handle manual navigation to a specific item
  const handleIndicatorClick = (index) => {
    if (index !== currentIndex && featuredMediaList[index]) {
      setCurrentIndex(index);
      handleMediaChange(featuredMediaList[index]);
    }
  };

  // Handle opening the more info dialog
  const handleMoreInfoOpen = () => {
    setSelectedMedia(displayedMedia);
    setMoreInfoOpen(true);
  };

  // Handle closing the more info dialog
  const handleMoreInfoClose = () => {
    setMoreInfoOpen(false);
  };

  if (!displayedMedia) return null;

  return (
    <Box
      sx={{
        height: '85vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 0 10% 4%',
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.3) 100%), url(${displayedMedia.backdropPath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        transition: 'opacity 0.3s ease-in-out',
        opacity: fadeIn ? 1 : 0.5,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          backgroundImage: 'linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0) 100%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Series or Movie Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#E50914', 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            fontSize: '1rem',
            letterSpacing: '1px',
            mr: 1
          }}
        >
          {displayedMedia.type === 'tv' ? 'Series' : 'Movie'}
        </Typography>
      </Box>

      {/* Title */}
      <Typography 
        variant="h1" 
        sx={{ 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          mb: 2,
          maxWidth: '60%'
        }}
      >
        {displayedMedia.title}
      </Typography>

      {/* Description */}
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'white', 
          maxWidth: { xs: '90%', sm: '70%', md: '40%' },
          mb: 3,
          textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
        }}
      >
        {displayedMedia.overview.length > 150 
          ? `${displayedMedia.overview.substring(0, 150)}...` 
          : displayedMedia.overview}
      </Typography>

      {/* More Info Button */}
      <Button 
        variant="contained" 
        startIcon={<InfoOutlinedIcon />}
        onClick={handleMoreInfoOpen}
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.2)', 
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.3)',
          },
          fontWeight: 'bold',
          px: 3,
          py: 1,
          borderRadius: '4px',
          textTransform: 'none',
          fontSize: '1rem',
          width: 'fit-content'
        }}
      >
        More Info
      </Button>

      {/* Carousel Indicators */}
      {featuredMediaList.length > 1 && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            position: 'absolute', 
            bottom: '5%', 
            left: 0, 
            right: 0 
          }}
        >
          {featuredMediaList.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleIndicatorClick(index)}
              sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                mx: 0.5,
                bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'background-color 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.8)',
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* More Info Dialog */}
      <MoreInfo 
        open={moreInfoOpen} 
        onClose={handleMoreInfoClose} 
        media={selectedMedia || displayedMedia} 
      />
    </Box>
  );
};

export default CoverPhotoSection; 