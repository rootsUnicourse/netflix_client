import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Container, 
  CircularProgress,
  CssBaseline
} from '@mui/material';
import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard';
import MoreInfo from '../components/MoreInfo';
import Footer from '../components/Footer';
import ApiService, { getTMDBNewAndPopular } from '../api/api';

const NewAndPopular = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  
  // Reference for the intersection observer
  const observer = useRef();
  
  // Reference for the last element in the grid
  const lastMediaElementRef = useCallback(node => {
    // Clear the current observer
    if (observer.current) observer.current.disconnect();
    
    // Skip if still loading
    if (loading) return;
    
    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible and we have more items to load
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, {
      root: null,
      rootMargin: '150px',
      threshold: 0.1
    });
    
    // Observe the last element
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch media when page changes
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch new and popular media from TMDB
        const response = await getTMDBNewAndPopular(page, 24, 'all');
        
        if (response.data && response.data.results) {
          // Filter out items without required images before setting state
          const validResults = response.data.results.filter(item => 
            item && item.posterPath && item.backdropPath
          );
          
          // Add new media to the existing list
          setMedia(prevMedia => {
            // When fetching the first page, replace all items
            if (page === 1) return validResults;
            
            // Otherwise, append new items, ensuring no duplicates
            const newItems = validResults; // Already filtered above
            const newMediaIds = new Set(newItems.map(getMediaIdentifier));
            
            const uniquePrevMedia = prevMedia.filter(item => {
              return item && !newMediaIds.has(getMediaIdentifier(item));
            });
            
            return [...uniquePrevMedia, ...newItems];
          });
          
          // Check if we've reached the end of the list
          setHasMore(page < response.data.totalPages);
          
          // If no valid results and it's the first page, show error
          if (validResults.length === 0 && page === 1) {
            setError('No valid media found with complete information');
          }
        } else {
          setError('No media found');
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media. Please try again later.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [page]);

  // Disable horizontal scrolling
  useEffect(() => {
    // Save original overflow style
    const originalOverflow = document.body.style.overflow;
    const originalOverflowX = document.body.style.overflowX;

    // Disable horizontal scrolling
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';

    // Cleanup function to restore original styles when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overflowX = originalOverflowX;
    };
  }, []);

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setMoreInfoOpen(true);
  };

  const handleCloseMoreInfo = () => {
    setMoreInfoOpen(false);
  };

  // Helper function to ensure we don't break on undefined properties
  const getMediaIdentifier = (item) => {
    if (!item) return '';
    const type = item.type || 'unknown';
    const id = item.tmdbId || item.id || 'unknown';
    return `${type}-${id}`;
  };

  // Helper function to validate an image URL
  const isValidImageUrl = (url) => {
    if (!url) return false;
    
    // Check if it's a placeholder image
    if (url.includes('placeholder') || url.includes('no-image')) return false;
    
    // Check if it's a valid URL format (basic check)
    return url.startsWith('http') && (
      url.endsWith('.jpg') || 
      url.endsWith('.jpeg') || 
      url.endsWith('.png') || 
      url.endsWith('.webp') ||
      url.includes('image.tmdb.org') // TMDB URLs are valid
    );
  };

  // Helper function to check if a media item has valid images
  const hasValidImages = (item) => {
    return item && 
      ((item.posterPath && isValidImageUrl(item.posterPath)) || 
       (item.backdropPath && isValidImageUrl(item.backdropPath)));
  };

  return (
    <Box sx={{ 
      flexGrow: 1,
      backgroundColor: '#141414',
      minHeight: '100vh',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflowX: 'hidden', // Disable horizontal scrolling at the container level too
    }}>
      <CssBaseline /> {/* Ensures consistent styling and removes default margins */}
      
      {/* Navbar */}
      <Navbar transparent={false} />
      
      {/* Main Content */}
      <Container maxWidth={false} sx={{ pt: 10, px: { xs: 0 }, overflowX: 'hidden' }}>
        {/* Media Grid */}
        <Grid container spacing={2} sx={{ mb: 4, px: { xs: 2, md: 4 } }}>
          {media.filter(hasValidImages).map((item, index) => {
            // Check if this is the last item
            const isLastElement = index === media.length - 1;
            
            // Generate a unique key for TMDB items
            const itemKey = item._id || `tmdb-${item.type || 'unknown'}-${item.tmdbId || index}-${index}`;
            
            return (
              <Grid 
                item 
                xs={4} 
                sm={3} 
                md={2} 
                lg={2} 
                key={itemKey}
                ref={isLastElement ? lastMediaElementRef : undefined}
              >
                <MediaCard media={item} onClick={() => handleMediaClick(item)} />
              </Grid>
            );
          })}
        </Grid>
        
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: 'red' }} />
          </Box>
        )}
        
        {/* Error message */}
        {error && !loading && media.length === 0 && (
          <Typography variant="body1" sx={{ color: 'red', textAlign: 'center', my: 4 }}>
            {error}
          </Typography>
        )}
        
        {/* End of list message */}
        {!hasMore && !loading && media.length > 0 && (
          <Typography variant="body1" sx={{ color: 'gray', textAlign: 'center', my: 4 }}>
            You've reached the end of the list.
          </Typography>
        )}
        
        {/* No content message */}
        {!loading && media.length === 0 && !error && (
          <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', my: 4 }}>
            No content available. Please check back later.
          </Typography>
        )}
      </Container>
      
      {/* Footer */}
      <Footer />
      
      {/* More Info Dialog */}
      <MoreInfo 
        open={moreInfoOpen} 
        onClose={handleCloseMoreInfo} 
        media={selectedMedia} 
      />
    </Box>
  );
};

export default NewAndPopular; 