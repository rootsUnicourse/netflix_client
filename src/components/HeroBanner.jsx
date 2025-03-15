import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

// Import the banner images
import SpaceForceImg from '../assets/images/spaceforce.jpeg';
import SuitsImg from '../assets/images/suits.png';
import Extraction2Img from '../assets/images/extraction2.jpeg';
import MarioBrosImg from '../assets/images/mariobros.png';

// Featured content with the provided shows/movies
const featuredContent = [
  {
    id: 1,
    title: 'Space Force',
    description: 'A four-star general begrudgingly teams up with an eccentric scientist to get the U.S. military\'s newest agency - Space Force - ready for lift-off.',
    image: SpaceForceImg,
    category: 'SERIES',
    rating: 'TV-MA',
    bgColor: '#1a2634'
  },
  {
    id: 2,
    title: 'Suits',
    description: 'On the run from a drug deal gone bad, brilliant college dropout Mike Ross finds himself working with Harvey Specter, one of New York City\'s best lawyers.',
    image: SuitsImg,
    category: 'SERIES',
    rating: 'TV-14',
    bgColor: '#0a1a2a'
  },
  {
    id: 3,
    title: 'Extraction 2',
    description: 'Back from the brink of death, highly skilled commando Tyler Rake takes on another dangerous mission: saving the imprisoned family of a ruthless gangster.',
    image: Extraction2Img,
    category: 'MOVIE',
    rating: 'R',
    bgColor: '#1a1a1a'
  },
  {
    id: 4,
    title: 'The Super Mario Bros. Movie',
    description: 'With help from Princess Peach, Mario gets ready to square off against the all-powerful Bowser to stop his plans from conquering the world.',
    image: MarioBrosImg,
    category: 'MOVIE',
    rating: 'PG',
    bgColor: '#1e2c3a'
  }
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextIndex, setNextIndex] = useState(1);
  
  // Preload next image
  useEffect(() => {
    setNextIndex((currentIndex + 1) % featuredContent.length);
    
    // Preload the next image
    const img = new Image();
    img.src = featuredContent[nextIndex].image;
  }, [currentIndex, nextIndex]);
  
  // Auto-rotate featured content every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [currentIndex]);
  
  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };
  
  const handlePrev = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? featuredContent.length - 1 : prevIndex - 1
      );
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };
  
  const currentContent = featuredContent[currentIndex];
  
  return (
    <Box
      sx={{
        position: 'relative',
        height: '80vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#141414',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isTransitioning ? 0.5 : 1,
          transition: 'opacity 0.5s ease-in-out',
          backgroundColor: currentContent.bgColor,
        }}
      >
        <img 
          src={currentContent.image}
          alt={currentContent.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            imageRendering: 'high-quality',
            transform: 'translateZ(0)', // Force hardware acceleration
            filter: isTransitioning ? 'blur(5px)' : 'none',
            transition: 'filter 0.5s ease-in-out',
          }}
        />
        <Box
          sx={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4) 100%), linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.7) 15%, rgba(20,20,20,0) 40%)',
            zIndex: 1
          }}
        />
      </Box>
      
      {/* Content */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '4%',
          width: '40%',
          zIndex: 2,
          opacity: isTransitioning ? 0 : 1,
          transform: `translateY(${isTransitioning ? '20px' : '0'})`,
          transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
        }}
      >
        {/* Category Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            component="span"
            sx={{
              color: 'red',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              mr: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            N
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
            {currentContent.category}
          </Typography>
        </Box>
        
        {/* Title */}
        <Typography
          variant="h1"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            textTransform: 'uppercase',
            mb: 2,
            lineHeight: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: '1px',
          }}
        >
          {currentContent.title}
        </Typography>
        
        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            mb: 3,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
            maxWidth: '90%',
            lineHeight: 1.4,
          }}
        >
          {currentContent.description}
        </Typography>
        
        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: 'white',
              color: 'black',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.75)',
              },
              px: 4,
              py: 1,
              borderRadius: '4px',
            }}
          >
            Play
          </Button>
          <Button
            variant="contained"
            startIcon={<InfoOutlinedIcon />}
            sx={{
              bgcolor: 'rgba(109, 109, 110, 0.7)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(109, 109, 110, 0.5)',
              },
              px: 4,
              py: 1,
              borderRadius: '4px',
            }}
          >
            More Info
          </Button>
        </Box>
      </Box>
      
      {/* Rating Badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '4%',
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '4px',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'white' }}>
          {currentContent.rating}
        </Typography>
      </Box>
      
      {/* Navigation Arrows */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: '2%',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          },
          zIndex: 3,
        }}
      >
        <NavigateBeforeIcon fontSize="large" />
      </IconButton>
      
      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: '2%',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          },
          zIndex: 3,
        }}
      >
        <NavigateNextIcon fontSize="large" />
      </IconButton>
      
      {/* Indicator Dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 3,
        }}
      >
        {featuredContent.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: '12px',
              height: '3px',
              bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'background-color 0.3s',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 500);
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroBanner; 