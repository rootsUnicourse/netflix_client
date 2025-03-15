import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ContentRow = ({ title, items }) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const rowRef = useRef(null);

  // Calculate how many items to slide based on container width
  const handleSlide = (direction) => {
    const container = rowRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const itemWidth = 280; // Increased width of each item including margins
    const itemsToSlide = Math.floor(containerWidth / itemWidth);
    const slideDelta = itemsToSlide * itemWidth;

    if (direction === 'left') {
      const newPosition = Math.min(sliderPosition + slideDelta, 0);
      setSliderPosition(newPosition);
      setShowRightArrow(true);
      setShowLeftArrow(newPosition < 0);
    } else {
      const maxScroll = -(items.length * itemWidth - containerWidth);
      const newPosition = Math.max(sliderPosition - slideDelta, maxScroll);
      setSliderPosition(newPosition);
      setShowLeftArrow(true);
      setShowRightArrow(newPosition > maxScroll);
    }
  };

  // Check if arrows should be shown on initial render
  useEffect(() => {
    const container = rowRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const totalContentWidth = items.length * 280; // Updated to match new item width
      setShowRightArrow(totalContentWidth > containerWidth);
    }
  }, [items]);

  return (
    <Box sx={{ mb: 4, position: 'relative', overflow: 'hidden' }}>
      {/* Row Title */}
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'white', 
          mb: 1, 
          fontWeight: 'bold',
          pl: 2
        }}
      >
        {title}
      </Typography>

      {/* Left Navigation Arrow */}
      {showLeftArrow && (
        <IconButton
          onClick={() => handleSlide('left')}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)',
            },
          }}
        >
          <NavigateBeforeIcon fontSize="large" />
        </IconButton>
      )}

      {/* Right Navigation Arrow */}
      {showRightArrow && (
        <IconButton
          onClick={() => handleSlide('right')}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)',
            },
          }}
        >
          <NavigateNextIcon fontSize="large" />
        </IconButton>
      )}

      {/* Content Slider */}
      <Box
        ref={rowRef}
        sx={{
          display: 'flex',
          overflowX: 'visible',
          px: 2,
          transition: 'transform 0.5s ease',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transform: `translateX(${sliderPosition}px)`,
            transition: 'transform 0.5s ease',
            position: 'relative',
          }}
        >
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                position: 'relative',
                minWidth: '260px',
                height: '146px', // 16:9 aspect ratio
                m: '0 10px',
                borderRadius: '4px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            >
              {/* Content Image */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: '#141414',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onError={(e) => {
                    // If image fails to load, set a placeholder background color
                    e.target.style.display = 'none';
                    e.target.parentNode.style.backgroundColor = '#333';
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ContentRow; 