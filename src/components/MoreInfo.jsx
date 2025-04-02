import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import Review from './Review';
import UserContext from '../context/UserContext';
import ApiService from '../api/api';

const MoreInfo = ({ open, onClose, media }) => {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [localInWatchlist, setLocalInWatchlist] = useState(false);
  const [fullMediaDetails, setFullMediaDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist, watchlist, currentProfile } = useContext(UserContext);

  // Clear details when dialog closes
  useEffect(() => {
    if (!open) {
      setFullMediaDetails(null);
      setAdditionalImages([]);
    }
  }, [open]);

  // Clear details when media changes
  useEffect(() => {
    setFullMediaDetails(null);
    setAdditionalImages([]);
    setIsLoading(true);
  }, [media]);

  // Fetch additional images for the media item
  const fetchAdditionalImages = useCallback(async () => {
    if (!media) return;
    
    try {
      setImagesLoading(true);
      const mediaType = media.type;
      const tmdbId = media.tmdbId || media.id;
      
      const response = await ApiService.getTMDBImages(mediaType, tmdbId, { 
        limit: 6,
        // Request a mix of different image types
        types: 'backdrop,still,logo,video' 
      });
      
      if (response.data && response.data.images) {
        // Filter out any images that match the main backdrop or poster
        const mainUrls = [
          fullMediaDetails?.backdropPath,
          fullMediaDetails?.posterPath
        ].filter(Boolean);
        
        const filteredImages = response.data.images
          .filter(img => !mainUrls.some(url => 
            img.url === url || img.thumbnailUrl === url
          ))
          .slice(0, 6);
          
        setAdditionalImages(filteredImages);
      }
    } catch (error) {
      console.error('Error fetching additional images:', error);
    } finally {
      setImagesLoading(false);
    }
  }, [media, fullMediaDetails]);

  // Fetch full media details when the dialog opens
  useEffect(() => {
    const fetchMediaDetails = async () => {
      if (open && media) {
        try {
          setIsLoading(true);
          
          // Check if the media object already has all the details we need
          if (media.fullDetails) {
            // Skip API call and use the data we already have
            setFullMediaDetails(media);
            setIsLoading(false);
            return;
          }
          
          // Otherwise use the TMDB API to get details
          const response = await ApiService.getTMDBDetails(
            media.type, 
            media.tmdbId ? media.tmdbId : media.id // Support both formats
          );
          setFullMediaDetails(response.data);
        } catch (error) {
          console.error('Error fetching media details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (open && media) {
      fetchMediaDetails();
    }
  }, [open, media]);

  // Fetch additional images once we have the media details
  useEffect(() => {
    if (fullMediaDetails && open) {
      fetchAdditionalImages();
    }
  }, [fullMediaDetails, open, fetchAdditionalImages]);

  // Update local watchlist status whenever any relevant state changes
  const updateWatchlistStatus = useCallback(() => {
    if (media) {
      // Use either the existing _id or create a unique identifier based on tmdbId
      const mediaId = media._id || `tmdb-${media.type}-${media.tmdbId || media.id}`;
      if (mediaId) {
        const inList = isInWatchlist(mediaId);
        setLocalInWatchlist(inList);
      }
    }
  }, [media, isInWatchlist]);

  // Initial load and whenever dependencies change
  useEffect(() => {
    updateWatchlistStatus();
  }, [media, watchlist, isInWatchlist, updateWatchlistStatus, currentProfile]);

  // When the dialog opens, check the status again
  useEffect(() => {
    if (open) {
      updateWatchlistStatus();
    }
  }, [open, updateWatchlistStatus]);

  if (!media || !fullMediaDetails || isLoading) {
    // Return loading state
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#181818',
            color: 'white',
            borderRadius: '8px',
            height: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#E50914', mb: 2 }} />
          <Typography variant="body1">Loading details...</Typography>
        </Box>
      </Dialog>
    );
  }

  const handleReviewClick = () => {
    // Ensure we use the correct format for the media ID
    const mediaId = media._id || (media.tmdbId ? `tmdb-${media.type || 'movie'}-${media.tmdbId}` : (media.id ? `tmdb-${media.type || 'movie'}-${media.id}` : null));
    
    if (!mediaId) {
      console.error('Media ID is missing or invalid');
      return;
    }
    console.log('Opening review modal with media ID:', mediaId);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      console.error('User needs to be logged in to use watchlist');
      return;
    }

    // When using TMDB directly, we may not have the _id property
    // So we'll use either the existing _id or create a unique identifier based on tmdbId
    const mediaId = media._id || `tmdb-${media.type}-${media.tmdbId || media.id}`;
    
    if (!mediaId) {
      console.error('Media ID is missing or invalid');
      return;
    }
    
    try {
      const newWatchlistStatus = !localInWatchlist;
      setLocalInWatchlist(newWatchlistStatus);
      
      // Create a media object with essential information for the watchlist
      const mediaObject = {
        _id: mediaId,
        title: media.title || fullMediaDetails.title,
        type: media.type || fullMediaDetails.type,
        posterPath: media.posterPath || fullMediaDetails.posterPath,
        backdropPath: media.backdropPath || fullMediaDetails.backdropPath,
        tmdbId: media.tmdbId || media.id || fullMediaDetails.id,
        overview: media.overview || fullMediaDetails.overview,
        isTMDB: mediaId.startsWith('tmdb-')
      };
      
      if (newWatchlistStatus) {
        addToWatchlist(mediaId, mediaObject).then(success => {
          if (!success) {
            setLocalInWatchlist(false);
            console.error('Failed to add to watchlist');
          }
        }).catch(error => {
          setLocalInWatchlist(false);
          console.error('Error adding to watchlist:', error);
        });
      } else {
        removeFromWatchlist(mediaId).then(success => {
          if (!success) {
            setLocalInWatchlist(true);
            console.error('Failed to remove from watchlist');
          }
        }).catch(error => {
          setLocalInWatchlist(true);
          console.error('Error removing from watchlist:', error);
        });
      }
    } catch (error) {
      setLocalInWatchlist(!localInWatchlist);
      console.error('Error toggling watchlist:', error);
    }
  };

  // Format runtime from minutes to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format date to year
  const formatYear = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  // Get episodes for the selected season
  const getEpisodes = () => {
    if (!fullMediaDetails.seasonData || !fullMediaDetails.seasonData[selectedSeason] || !fullMediaDetails.seasonData[selectedSeason].episodes) {
      return [];
    }
    return fullMediaDetails.seasonData[selectedSeason].episodes;
  };

  // Get images to display in the photos section
  const getPhotosToDisplay = () => {
    // First try to use the new API results
    if (additionalImages.length > 0) {
      return additionalImages.slice(0, 3).map(img => img.url || img.thumbnailUrl);
    }
    
    // Fall back to the original additionalImages from the media details
    return fullMediaDetails.additionalImages || [];
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            bgcolor: '#181818',
            color: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            maxHeight: '90vh',
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Header Image */}
          <Box
            sx={{
              height: { xs: '300px', sm: '350px', md: '400px' },
              width: '100%',
              backgroundImage: `linear-gradient(to top, rgba(24,24,24,1) 0%, rgba(24,24,24,0) 50%), url(${fullMediaDetails.backdropPath})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: '#181818',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(24,24,24,0.7)' },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Title and buttons positioned at bottom of image */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                p: 3,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                {fullMediaDetails.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ThumbUpAltOutlinedIcon />}
                  onClick={handleReviewClick}
                  sx={{
                    bgcolor: 'white',
                    color: 'black',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
                    fontWeight: 'bold',
                    px: 4,
                    py: 1,
                  }}
                >
                  Review
                </Button>

                <Tooltip title={localInWatchlist ? "Remove from My List" : "Add to My List"}>
                  <IconButton
                    onClick={handleWatchlistToggle}
                    sx={{
                      bgcolor: 'rgba(42, 42, 42, 0.7)',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      '&:hover': { bgcolor: 'rgba(42, 42, 42, 0.9)' },
                      transition: 'all 0.2s ease-in-out',
                      width: 42,
                      height: 42,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 24,
                      height: 24,
                      position: 'relative',
                    }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: localInWatchlist 
                            ? 'translate(-50%, -50%) scale(1)' 
                            : 'translate(-50%, -50%) scale(0.5)',
                          opacity: localInWatchlist ? 1 : 0,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <CheckIcon fontSize="small" />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: localInWatchlist 
                            ? 'translate(-50%, -50%) scale(0.5)' 
                            : 'translate(-50%, -50%) scale(1)',
                          opacity: localInWatchlist ? 0 : 1,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </Box>
                    </Box>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          <DialogContent sx={{
            bgcolor: '#181818',
            p: 3,
            overflowY: 'auto',
            maxHeight: { xs: 'calc(90vh - 300px)', sm: 'calc(90vh - 350px)', md: 'calc(90vh - 400px)' },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#181818',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#555',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#777',
            },
          }}>
            {/* Info section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {/* Details row */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ color: '#46d369', fontWeight: 'bold', mr: 1 }}>
                    {Math.round(fullMediaDetails.voteAverage * 10)}% Match
                  </Typography>
                  <Typography sx={{ color: '#777', mr: 1 }}>
                    {formatYear(fullMediaDetails.releaseDate)}
                  </Typography>
                  <Chip
                    label={fullMediaDetails.maturityRating || 'Not Rated'}
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1px solid #777',
                      color: '#777',
                      height: '20px',
                      mr: 1
                    }}
                  />
                  {fullMediaDetails.type === 'movie' ? (
                    <Typography sx={{ color: '#777' }}>
                      {formatRuntime(fullMediaDetails.runtime)}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: '#777' }}>
                      {fullMediaDetails.seasons} {fullMediaDetails.seasons === 1 ? 'Season' : 'Seasons'}
                    </Typography>
                  )}
                </Box>

                {/* Overview */}
                <Typography sx={{ mb: 3 }}>
                  {fullMediaDetails.overview}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Cast & Crew */}
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ color: '#f0f0f0', mb: 0.5 }}>
                    <Typography component="span" sx={{ color: '#777' }}>Cast: </Typography>
                    {fullMediaDetails.cast?.slice(0, 3).map((actor, index) => (
                      <React.Fragment key={actor.id}>
                        <Typography component="span">{actor.name}</Typography>
                        {index < Math.min(fullMediaDetails.cast.length, 3) - 1 && ', '}
                      </React.Fragment>
                    ))}
                    {fullMediaDetails.cast?.length > 3 && ', more...'}
                  </Typography>

                  <Typography sx={{ color: '#f0f0f0' }}>
                    <Typography component="span" sx={{ color: '#777' }}>Genres: </Typography>
                    {fullMediaDetails.genres?.join(', ')}
                  </Typography>

                  <Typography sx={{ color: '#f0f0f0' }}>
                    <Typography component="span" sx={{ color: '#777' }}>This show is: </Typography>
                    {fullMediaDetails.contentTags?.slice(0, 2).join(', ')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Episodes section (for TV shows only) */}
            {fullMediaDetails.type === 'tv' && fullMediaDetails.seasonData && fullMediaDetails.seasonData.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Episodes
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {fullMediaDetails.title}
                  </Typography>
                </Box>

                <List sx={{ bgcolor: '#2F2F2F', borderRadius: '4px', p: 0 }}>
                  {getEpisodes().map((episode, index) => (
                    <React.Fragment key={index}>
                      <ListItem 
                        sx={{ 
                          py: 3, 
                          px: 3,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2
                        }}
                      >
                        <Typography 
                          sx={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold',
                            color: '#fff',
                            width: '30px',
                            textAlign: 'center',
                            mt: 3
                          }}
                        >
                          {episode.episodeNumber}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            position: 'relative',
                            width: '130px', 
                            height: '80px', 
                            borderRadius: '4px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            mt: 1
                          }}
                        >
                          <Box
                            component="img"
                            src={episode.stillPath || fullMediaDetails.backdropPath}
                            alt={episode.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              bgcolor: 'rgba(0,0,0,0.5)',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </Box>
                        </Box>
                        
                        <Box sx={{ flex: 1, mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {episode.name}
                            </Typography>
                            <Typography sx={{ color: '#fff' }}>
                              {episode.runtime ? `${episode.runtime}m` : ''}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#D2D2D2', lineHeight: 1.4, fontSize: '0.9rem' }}>
                            {episode.overview}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < getEpisodes().length - 1 && <Divider sx={{ bgcolor: '#444' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Photos section - moved below the details */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Photos
              </Typography>
              {imagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={30} sx={{ color: '#E50914' }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                  {getPhotosToDisplay().length > 0 ? (
                    getPhotosToDisplay().map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image}
                        alt={`${fullMediaDetails.title} scene ${index + 1}`}
                        sx={{
                          width: '200px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ))
                  ) : (
                    // Placeholder images if none available
                    [1, 2, 3].map((num) => (
                      <Box
                        key={num}
                        sx={{
                          width: '200px',
                          height: '120px',
                          bgcolor: '#333',
                          borderRadius: '4px'
                        }}
                      />
                    ))
                  )}
                </Box>
              )}
            </Box>

            {/* About section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                About {fullMediaDetails.title}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    {fullMediaDetails.type === 'movie' ? 'Director:' : 'Director:'}
                  </Typography>
                  {fullMediaDetails.type === 'movie'
                    ? fullMediaDetails.director || 'Unknown'
                    : fullMediaDetails.creators?.join(', ') || 'Unknown'}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    Cast:
                  </Typography>
                  {fullMediaDetails.cast?.slice(0, 10).map((actor, index) => (
                    <React.Fragment key={actor.id}>
                      <Typography component="span">{actor.name}</Typography>
                      {index < Math.min(fullMediaDetails.cast.length, 10) - 1 && ', '}
                    </React.Fragment>
                  ))}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    Genres:
                  </Typography>
                  {fullMediaDetails.genres?.join(', ')}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    This show is:
                  </Typography>
                  {fullMediaDetails.contentTags?.slice(0, 3).join(', ') || 'No tags available'}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    Maturity rating:
                  </Typography>
                  {fullMediaDetails.maturityRating || 'Not Rated'}
                </Typography>

                {fullMediaDetails.maturityRating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box
                      sx={{
                        border: '1px solid #777',
                        px: 1,
                        py: 0.5,
                        mr: 2,
                        borderRadius: 0.5,
                        fontSize: '14px',
                        color: '#f0f0f0'
                      }}
                    >
                      {fullMediaDetails.maturityRating}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
        </Box>
      </Dialog>

      {/* Review Modal */}
      <Review 
        open={reviewModalOpen} 
        onClose={handleCloseReviewModal}
        mediaIdProp={media._id || (media.tmdbId ? `tmdb-${media.type || 'movie'}-${media.tmdbId}` : (media.id ? `tmdb-${media.type || 'movie'}-${media.id}` : null))}
      />
    </>
  );
};

export default MoreInfo; 