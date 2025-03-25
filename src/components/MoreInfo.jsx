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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import Review from './Review';
import UserContext from '../context/UserContext';

const MoreInfo = ({ open, onClose, media }) => {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [localInWatchlist, setLocalInWatchlist] = useState(false);
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist, watchlist, currentProfile } = useContext(UserContext);

  // Update local watchlist status whenever any relevant state changes
  const updateWatchlistStatus = useCallback(() => {
    if (media && media._id) {
      const inList = isInWatchlist(media._id);
      console.log('Updating watchlist status for', media.title, 'is in watchlist:', inList);
      setLocalInWatchlist(inList);
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

  console.log('MoreInfo media:', media, 'localInWatchlist:', localInWatchlist);

  if (!media) return null;

  const handleReviewClick = () => {
    console.log('Media object:', media);
    
    // Check if media._id is a valid MongoDB ID
    if (!media._id) {
      console.error('Media ID is missing or invalid');
      return;
    }
    
    // Open the review modal instead of navigating
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      // Handle not logged in scenario
      console.log('User needs to be logged in to use watchlist');
      return;
    }

    const mediaId = media._id;
    
    if (!mediaId) {
      console.error('Media ID is missing or invalid');
      return;
    }
    
    try {
      console.log('Watchlist toggle for media:', mediaId, 'Current status:', localInWatchlist);
      
      // Immediately update UI for better responsiveness
      const newWatchlistStatus = !localInWatchlist;
      setLocalInWatchlist(newWatchlistStatus);
      
      // API call in background
      if (newWatchlistStatus) {
        // Adding to watchlist
        addToWatchlist(mediaId).then(success => {
          if (!success) {
            // Revert UI only if the operation failed
            setLocalInWatchlist(false);
            console.error('Failed to add to watchlist');
          }
        }).catch(error => {
          // Revert UI on error
          setLocalInWatchlist(false);
          console.error('Error adding to watchlist:', error);
        });
      } else {
        // Removing from watchlist
        removeFromWatchlist(mediaId).then(success => {
          if (!success) {
            // Revert UI only if the operation failed
            setLocalInWatchlist(true);
            console.error('Failed to remove from watchlist');
          }
        }).catch(error => {
          // Revert UI on error
          setLocalInWatchlist(true);
          console.error('Error removing from watchlist:', error);
        });
      }
    } catch (error) {
      // Revert UI on any other error
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
    if (!media.seasonData || !media.seasonData[selectedSeason] || !media.seasonData[selectedSeason].episodes) {
      return [];
    }
    return media.seasonData[selectedSeason].episodes;
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
            maxHeight: '90vh', // Limit maximum height to 90% of viewport height
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Header Image */}
          <Box
            sx={{
              height: { xs: '300px', sm: '350px', md: '400px' },
              width: '100%',
              backgroundImage: `linear-gradient(to top, rgba(24,24,24,1) 0%, rgba(24,24,24,0) 50%), url(${media.backdropPath})`,
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
                {media.title}
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
                    {Math.round(media.voteAverage * 10)}% Match
                  </Typography>
                  <Typography sx={{ color: '#777', mr: 1 }}>
                    {formatYear(media.releaseDate)}
                  </Typography>
                  <Chip
                    label={media.maturityRating || 'Not Rated'}
                    size="small"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1px solid #777',
                      color: '#777',
                      height: '20px',
                      mr: 1
                    }}
                  />
                  {media.type === 'movie' ? (
                    <Typography sx={{ color: '#777' }}>
                      {formatRuntime(media.runtime)}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: '#777' }}>
                      {media.seasons} {media.seasons === 1 ? 'Season' : 'Seasons'}
                    </Typography>
                  )}
                </Box>

                {/* Overview */}
                <Typography sx={{ mb: 3 }}>
                  {media.overview}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Cast & Crew */}
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ color: '#f0f0f0', mb: 0.5 }}>
                    <Typography component="span" sx={{ color: '#777' }}>Cast: </Typography>
                    {media.cast?.slice(0, 3).map((actor, index) => (
                      <React.Fragment key={actor.id}>
                        <Typography component="span">{actor.name}</Typography>
                        {index < Math.min(media.cast.length, 3) - 1 && ', '}
                      </React.Fragment>
                    ))}
                    {media.cast?.length > 3 && ', more...'}
                  </Typography>

                  <Typography sx={{ color: '#f0f0f0' }}>
                    <Typography component="span" sx={{ color: '#777' }}>Genres: </Typography>
                    {media.genres?.join(', ')}
                  </Typography>

                  <Typography sx={{ color: '#f0f0f0' }}>
                    <Typography component="span" sx={{ color: '#777' }}>This show is: </Typography>
                    {media.contentTags?.slice(0, 2).join(', ')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Episodes section (for TV shows only) */}
            {media.type === 'tv' && media.seasonData && media.seasonData.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Episodes
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {media.title}
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
                            src={episode.stillPath || media.backdropPath}
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
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {media.additionalImages?.length > 0 ? (
                  media.additionalImages.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={image}
                      alt={`${media.title} scene ${index + 1}`}
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
            </Box>

            {/* About section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                About {media.title}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    {media.type === 'movie' ? 'Director:' : 'Director:'}
                  </Typography>
                  {media.type === 'movie'
                    ? media.director || 'Unknown'
                    : media.creators?.join(', ') || 'Unknown'}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    Cast:
                  </Typography>
                  {media.cast?.slice(0, 10).map((actor, index) => (
                    <React.Fragment key={actor.id}>
                      <Typography component="span">{actor.name}</Typography>
                      {index < Math.min(media.cast.length, 10) - 1 && ', '}
                    </React.Fragment>
                  ))}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    Genres:
                  </Typography>
                  {media.genres?.join(', ')}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    This show is:
                  </Typography>
                  {media.contentTags?.slice(0, 3).join(', ') || 'No tags available'}
                </Typography>

                <Typography sx={{ color: '#f0f0f0' }}>
                  <Typography component="span" sx={{ color: '#777', fontWeight: 'bold', mr: 1 }}>
                    Maturity rating:
                  </Typography>
                  {media.maturityRating || 'Not Rated'}
                </Typography>

                {media.maturityRating && (
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
                      {media.maturityRating}
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
        mediaIdProp={media._id}
      />
    </>
  );
};

export default MoreInfo; 