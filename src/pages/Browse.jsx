import React, { useContext, useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    IconButton,
    CssBaseline,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Button,
    Pagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../api/api';
import Footer from '../components/Footer';
import MoreInfo from '../components/MoreInfo';
import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard';
import Loading from '../components/Loading';

const NavButton = styled(Button)(({ theme }) => ({
    color: '#e5e5e5',
    marginRight: theme.spacing(2),
    '&:hover': {
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 'normal',
    padding: '4px 8px',
}));

const FilterSelect = styled(FormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: 180,
    '& .MuiInputBase-root': {
        color: 'white',
        backgroundColor: 'rgba(20, 20, 20, 0.7)',
        borderRadius: '4px',
        border: '1px solid #333',
        height: '34px',
        '&:before, &:after': {
            display: 'none',
        },
        '&:hover': {
            border: '1px solid #555',
        },
    },
    '& .MuiSelect-select': {
        paddingTop: '7px',
        paddingBottom: '7px',
        paddingLeft: '10px',
    },
    '& .MuiInputLabel-root': {
        display: 'none',
    },
    '& .MuiSelect-icon': {
        color: 'white',
    },
}));

const MediaCardStyled = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 0,
    paddingTop: '56.25%', // 16:9 aspect ratio (horizontal instead of vertical)
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
        zIndex: 2,
    },
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    margin: '5px',
    backgroundColor: '#333', // Add background color for cards without images
}));

const MediaImage = styled('img')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
});

const RecentlyAddedTag = styled(Box)({
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'red',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 1,
});

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Browse() {
    const { profiles, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // MoreInfo component state
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [moreInfoOpen, setMoreInfoOpen] = useState(false);
    
    // Filter states
    const [genreFilter, setGenreFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [ageRatingFilter, setAgeRatingFilter] = useState('all');
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    
    // Filter options states
    const [genres, setGenres] = useState([
        { value: 'all', label: 'All Genres' }
    ]);
    
    const [languages, setLanguages] = useState([
        { value: 'all', label: 'All Languages' }
    ]);
    
    const [ageRatings, setAgeRatings] = useState([
        { value: 'all', label: 'All Ratings' }
    ]);

    // Get the current profile from sessionStorage or use the first profile
    useEffect(() => {
        const currentProfile = sessionStorage.getItem('currentProfile');
        if (currentProfile) {
            setSelectedProfile(JSON.parse(currentProfile));
        } else if (profiles && profiles.length > 0) {
            setSelectedProfile(profiles[0]);
            sessionStorage.setItem('currentProfile', JSON.stringify(profiles[0]));
        }
    }, [profiles]);

    // Initial data fetch to get available media and populate filter options
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch media using the new TMDB browse endpoint
                const response = await ApiService.getBrowseMedia({
                    genre: 'all',
                    language: 'all',
                    rating: 'all',
                    page: 1,
                    limit: 100
                });
                
                if (response && response.results) {
                    setMedia(response.results);
                    setTotalPages(response.totalPages);
                    setTotalResults(response.totalResults);
                    
                    // Update filter options with data from the response
                    if (response.filters) {
                        if (response.filters.genres) {
                            setGenres(response.filters.genres);
                        }
                        
                        if (response.filters.languages) {
                            setLanguages(response.filters.languages);
                        }
                        
                        if (response.filters.ratings) {
                            setAgeRatings(response.filters.ratings);
                        }
                    }
                } else {
                    setMedia([]);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching initial media data:', error);
                setIsLoading(false);
            }
        };
        
        fetchInitialData();
    }, []);
    
    // Fetch media with applied filters
    useEffect(() => {
        const fetchFilteredMedia = async () => {
            try {
                setIsLoading(true);
                
                // Fetch media using the new TMDB browse endpoint with filters
                const response = await ApiService.getBrowseMedia({
                    genre: genreFilter,
                    language: languageFilter,
                    rating: ageRatingFilter,
                    page: page,
                    limit: 100
                });
                
                if (response && response.results) {
                    setMedia(response.results);
                    setTotalPages(response.totalPages);
                    setTotalResults(response.totalResults);
                } else {
                    setMedia([]);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching media with filters:', error);
                setIsLoading(false);
            }
        };

        fetchFilteredMedia();
    }, [genreFilter, languageFilter, ageRatingFilter, page]);

    // Remove redundant media fetch
    // Keep only the fetched filtered media effect
    useEffect(() => {
        // Disable horizontal scrolling
        const originalOverflow = document.body.style.overflow;
        const originalOverflowX = document.body.style.overflowX;

        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.overflowX = originalOverflowX;
        };
    }, []);

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        sessionStorage.setItem('currentProfile', JSON.stringify(profile));
    };

    const handleSwitchProfiles = () => {
        navigate('/profiles');
    };

    // Navigate to other pages
    const navigateTo = (path) => {
        navigate(path);
    };

    const handleGenreChange = (event) => {
        setGenreFilter(event.target.value);
        setPage(1); // Reset to first page when changing filters
    };

    const handleLanguageChange = (event) => {
        setLanguageFilter(event.target.value);
        setPage(1); // Reset to first page when changing filters
    };

    const handleAgeRatingChange = (event) => {
        setAgeRatingFilter(event.target.value);
        setPage(1); // Reset to first page when changing filters
    };
    
    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo(0, 0); // Scroll to top when changing pages
    };
    
    // Reset all filters to 'all'
    const handleResetFilters = () => {
        setGenreFilter('all');
        setLanguageFilter('all');
        setAgeRatingFilter('all');
        setPage(1); // Reset to first page when resetting filters
    };

    // Calculate number of active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (genreFilter !== 'all') count++;
        if (languageFilter !== 'all') count++;
        if (ageRatingFilter !== 'all') count++;
        return count;
    };

    const handleMediaClick = (media) => {
        // Prepare media object for MoreInfo component
        const preparedMedia = prepareMediaForMoreInfo(media);
        // Open MoreInfo component
        setSelectedMedia(preparedMedia);
        setMoreInfoOpen(true);
    };
    
    // Prepare media object for MoreInfo component
    const prepareMediaForMoreInfo = (media) => {
        if (!media) return null;
        
        // Create a copy to avoid modifying the original
        const prepared = { ...media };
        
        // TMDB ID handling
        if (prepared.tmdbId && !prepared._id) {
            prepared._id = `tmdb-${prepared.mediaType}-${prepared.tmdbId}`;
        }
        
        return prepared;
    };
    
    const handleMoreInfoClose = () => {
        setMoreInfoOpen(false);
    };

    // Check if a media item was recently added (within the last 30 days)
    const isRecentlyAdded = (releaseDate) => {
        if (!releaseDate) return false;
        
        const released = new Date(releaseDate);
        if (isNaN(released.getTime())) return false; // Invalid date
        
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        return released >= thirtyDaysAgo;
    };

    // Simplified function based on how other components handle images
    const getImageUrl = (item) => {
        if (!item) return 'https://via.placeholder.com/300x170?text=No+Image'; // 16:9 ratio
        
        // For horizontal display, prioritize backdrop images which are typically in landscape format
        if (item.backdropPath) return item.backdropPath;
        if (item.posterPath) return item.posterPath;
        if (item.additionalImages && item.additionalImages.length > 0) return item.additionalImages[0];
        if (item.backdropUrl) return item.backdropUrl; // Prioritize backdrop over poster
        if (item.imageUrl) return item.imageUrl;
        if (item.posterUrl) return item.posterUrl;
        
        // Fallbacks
        if (item.img) return item.img;
        
        // Check if there's a backdrop or poster object with a path
        if (item.backdrop) {
            if (typeof item.backdrop === 'string') return item.backdrop;
            if (item.backdrop.path) return item.backdrop.path;
        }
        
        if (item.poster) {
            if (typeof item.poster === 'string') return item.poster;
            if (item.poster.path) return item.poster.path;
        }
        
        // Check if there's an image object with a path
        if (item.image) {
            if (typeof item.image === 'string') return item.image;
            if (item.image.path) return item.image.path;
        }
        
        // Fallback
        return 'https://via.placeholder.com/300x170?text=No+Image'; // 16:9 ratio
    };

    // Add a debug function to examine a media item when rendered
    const debugMediaItem = (item, index) => {
        if (index === 0) { // Only debug the first item to avoid console spam
            console.log(`Rendering media item: ${item.title}`, {
                id: item._id,
                imageUrl: getImageUrl(item),
                releaseDate: item.releaseDate,
                genres: item.genres,
                language: item.originalLanguage || item.language,
                ageRating: item.ageRating || item.contentRating
            });
        }
        return null;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Box sx={{
            flexGrow: 1,
            bgcolor: '#141414',
            minHeight: '100vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflowX: 'hidden', // Disable horizontal scrolling at the container level too
        }}>
            <CssBaseline />
            
            {/* Use shared Navbar component with transparent background */}
            <Navbar transparent={true} />

            {/* Main Content Container */}
            <Container maxWidth={false} sx={{ pt: 8, px: { xs: 0 }, overflowX: 'hidden' }}>
                {/* Browse Page Title */}
                <Box sx={{ px: 4, pb: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                        variant="h2" 
                        component="h1" 
                        sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            fontSize: { xs: '2.5rem', md: '3.5rem' }
                        }}
                    >
                        Browse all titles
                    </Typography>
                </Box>

                {/* Filters Bar - Styled like the image */}
                <Box sx={{ 
                    px: 4, 
                    py: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(0,0,0,0.4)',
                    mb: 2
                }}>
                    <Typography sx={{ 
                        color: 'white', 
                        mr: 2, 
                        fontSize: '16px',
                        fontWeight: 'light'
                    }}>
                        Select Your Preferences
                    </Typography>
                    
                    {/* Original Language Filter */}
                    <Box sx={{ mr: 2 }}>
                        <FormControl sx={{ minWidth: 180 }}>
                            <Select
                                value={languageFilter}
                                onChange={handleLanguageChange}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === 'all') return "Original Language";
                                    const selected = languages.find(lang => lang.value === value);
                                    return selected ? selected.label : "Original Language";
                                }}
                                sx={{
                                    bgcolor: '#000',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 0,
                                    height: '40px',
                                    "& .MuiSelect-icon": {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none"
                                    }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: '#282828',
                                            color: 'white',
                                            "& .MuiMenuItem-root:hover": {
                                                bgcolor: 'rgba(255,255,255,0.1)'
                                            }
                                        }
                                    }
                                }}
                            >
                                {languages.map((language) => (
                                    <MenuItem key={language.value} value={language.value}>
                                        {language.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {/* Genre Filter */}
                    <Box sx={{ mr: 2 }}>
                        <FormControl sx={{ minWidth: 180 }}>
                            <Select
                                value={genreFilter}
                                onChange={handleGenreChange}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === 'all') return "Genres";
                                    const selected = genres.find(genre => genre.value === value);
                                    return selected ? selected.label : "Genres";
                                }}
                                sx={{
                                    bgcolor: '#000',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 0,
                                    height: '40px',
                                    "& .MuiSelect-icon": {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none"
                                    }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: '#282828',
                                            color: 'white',
                                            "& .MuiMenuItem-root:hover": {
                                                bgcolor: 'rgba(255,255,255,0.1)'
                                            }
                                        }
                                    }
                                }}
                            >
                                {genres.map((genre) => (
                                    <MenuItem key={genre.value} value={genre.value}>
                                        {genre.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Rating Filter */}
                    <Box sx={{ mr: 2 }}>
                        <FormControl sx={{ minWidth: 180 }}>
                            <Select
                                value={ageRatingFilter}
                                onChange={handleAgeRatingChange}
                                displayEmpty
                                renderValue={(value) => {
                                    if (value === 'all') return "Ratings";
                                    const selected = ageRatings.find(rating => rating.value === value);
                                    return selected ? selected.label : "Ratings";
                                }}
                                sx={{
                                    bgcolor: '#000',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 0,
                                    height: '40px',
                                    "& .MuiSelect-icon": {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none"
                                    }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: '#282828',
                                            color: 'white',
                                            "& .MuiMenuItem-root:hover": {
                                                bgcolor: 'rgba(255,255,255,0.1)'
                                            }
                                        }
                                    }
                                }}
                            >
                                {ageRatings.map((rating) => (
                                    <MenuItem key={rating.value} value={rating.value}>
                                        {rating.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {/* Reset Filters Button - Only show if filters are active */}
                    {getActiveFilterCount() > 0 && (
                        <Box sx={{ ml: 'auto' }}>
                            <IconButton 
                                onClick={handleResetFilters}
                                sx={{ 
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)'
                                    },
                                    borderRadius: 1
                                }}
                                size="small"
                            >
                                <FilterAltOffIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {/* Media Grid */}
                {isLoading ? (
                    <Loading />
                ) : (
                    <Box sx={{ p: 3 }}>
                        {media.length > 0 ? (
                            <Grid container spacing={2}>
                                {media.map((item) => (
                                    <Grid item key={item.tmdbId || item._id} xs={6} sm={4} md={3} lg={2.4}>
                                        <Box 
                                            sx={{ 
                                                position: 'relative',
                                                height: 0,
                                                paddingTop: '56.25%', // 16:9 aspect ratio
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                transition: 'transform 0.3s ease',
                                                borderRadius: '4px',
                                                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                                                backgroundColor: '#333',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    zIndex: 1,
                                                },
                                            }}
                                            onClick={() => handleMediaClick(item)}
                                        >
                                            <Box 
                                                component="img"
                                                src={item.backdropUrl || item.backdropPath || item.posterPath || getImageUrl(item)}
                                                alt={item.title}
                                                sx={{ 
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                }}
                                            />
                                            {isRecentlyAdded(item.releaseDate || item.release_date || item.first_air_date) && (
                                                <RecentlyAddedTag>NEW</RecentlyAddedTag>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '50vh',
                                color: 'white'
                            }}>
                                <Typography variant="h5" sx={{ mb: 2 }}>
                                    No results found for your current filters
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
                                    Try adjusting your filters or resetting them to see more titles.
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleResetFilters}
                                    sx={{
                                        backgroundColor: '#E50914',
                                        '&:hover': {
                                            backgroundColor: '#B81D24',
                                        }
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </Box>
                        )}
                        
                        {/* Pagination */}
                        {totalPages > 1 && media.length > 0 && (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center',
                                mt: 4,
                                mb: 2
                            }}>
                                <Pagination 
                                    count={totalPages} 
                                    page={page} 
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            color: 'white',
                                        },
                                        '& .Mui-selected': {
                                            backgroundColor: 'rgba(255, 0, 0, 0.8) !important',
                                        },
                                        '& .MuiPaginationItem-root:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Container>

            {/* Footer */}
            <Footer />
            
            {/* MoreInfo Dialog */}
            {selectedMedia && (
                <MoreInfo
                    open={moreInfoOpen}
                    onClose={handleMoreInfoClose}
                    media={selectedMedia}
                />
            )}
        </Box>
    );
} 