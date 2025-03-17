import React from 'react';
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
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import { useNavigate } from 'react-router-dom';

const MoreInfo = ({ open, onClose, media }) => {
  const navigate = useNavigate();

  if (!media) return null;

  const handleReviewClick = () => {
    // Will navigate to review page in the future
    console.log('Navigate to review page');
    // navigate(`/review/${media._id}`);
  };

  const handleAddToWatchlist = () => {
    // Will add to watchlist in the future
    console.log('Add to watchlist');
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

  return (
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
                startIcon={<PlayArrowIcon />}
                sx={{
                  bgcolor: 'white',
                  color: 'black',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
                  fontWeight: 'bold',
                  px: 4,
                  py: 1,
                }}
              >
                Play
              </Button>

              <Button
                variant="contained"
                startIcon={<ThumbUpAltOutlinedIcon />}
                onClick={handleReviewClick}
                sx={{
                  bgcolor: 'rgba(109, 109, 110, 0.7)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(109, 109, 110, 0.9)' },
                  px: 3,
                }}
              >
                Review
              </Button>

              <IconButton
                onClick={handleAddToWatchlist}
                sx={{
                  bgcolor: 'rgba(42, 42, 42, 0.7)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  '&:hover': { bgcolor: 'rgba(42, 42, 42, 0.9)' },
                }}
              >
                <AddIcon />
              </IconButton>
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
          {media.type === 'tv' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Episodes
              </Typography>

              <List sx={{ bgcolor: '#333', borderRadius: '4px' }}>
                {/* This is a placeholder. In a real implementation, you would fetch and display actual episodes */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <React.Fragment key={num}>
                    <ListItem sx={{ py: 2 }}>
                      <Typography sx={{ mr: 2, color: '#777' }}>{num}</Typography>
                      <Box sx={{ width: '130px', height: '80px', bgcolor: '#555', mr: 2, borderRadius: '4px' }} />
                      <ListItemText
                        primary={`Episode ${num}`}
                        secondary={
                          <Typography variant="body2" sx={{ color: '#777' }}>
                            {`${Math.floor(Math.random() * 20 + 30)}m`}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {num < 8 && <Divider sx={{ bgcolor: '#444' }} />}
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
  );
};

export default MoreInfo; 