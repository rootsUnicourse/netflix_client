import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const TopTenRow = ({ title, items }) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const rowRef = useRef(null);

  // Calculate how many items to slide based on container width
  const handleSlide = (direction) => {
    const container = rowRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const itemWidth = 200; // Approximate width of each item including margins
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
      const totalContentWidth = items.length * 200; // Updated to match new item width
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
          height: '240px', // Increased height for portrait images
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transform: `translateX(${sliderPosition}px)`,
            transition: 'transform 0.5s ease',
            position: 'relative',
            height: '100%',
          }}
        >
          {items.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                position: 'relative',
                minWidth: '160px', // Narrower for portrait orientation
                height: '100%',
                m: '0 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Large Number */}
              <Typography
                variant="h1"
                sx={{
                  position: 'absolute',
                  left: '-30px',
                  fontSize: '200px',
                  fontWeight: 'bold',
                  color: '#333',
                  opacity: 0.8,
                  zIndex: 0,
                  fontFamily: 'Arial, sans-serif',
                  WebkitTextStroke: '2px #555',
                  lineHeight: '0.8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100%',
                }}
              >
                {index + 1}
              </Typography>
              
              {/* Content Image - Portrait Orientation */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: '#141414',
                  zIndex: 1,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  ml: '20px', // Offset to account for the number
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

export default TopTenRow; 