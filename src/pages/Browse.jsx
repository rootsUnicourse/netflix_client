import React, { useContext, useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    CssBaseline,
    Grid,
    FormControl,
    Select,
    InputLabel,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NetflixLogo from '../assets/images/netflixlogo.png';
import { getMedia } from '../api/api';
import Footer from '../components/Footer';
import MoreInfo from '../components/MoreInfo';

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

const MediaCard = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: 0,
    paddingTop: '150%', // Maintain aspect ratio for posters (2:3)
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

const MediaTitle = styled(Typography)({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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

export default function Browse() {
    const { user, profiles } = useContext(UserContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
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
    
    // Genre options (derived from typical Netflix genres)
    const [genres, setGenres] = useState([
        { value: 'all', label: 'All Genres' },
        { value: 'action', label: 'Action' },
        { value: 'animation', label: 'Animation' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'documentary', label: 'Documentary' },
        { value: 'drama', label: 'Drama' },
        { value: 'horror', label: 'Horror' },
        { value: 'romance', label: 'Romance' },
        { value: 'sci-fi', label: 'Sci-Fi' },
        { value: 'thriller', label: 'Thriller' }
    ]);
    
    // Language options
    const [languages, setLanguages] = useState([
        { value: 'all', label: 'All Languages' },
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
        { value: 'de', label: 'German' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'zh', label: 'Chinese' },
        { value: 'hi', label: 'Hindi' },
        { value: 'he', label: 'Hebrew' },
        { value: 'ar', label: 'Arabic' }
    ]);
    
    // Age rating options updated to match actual maturityRating values
    const [ageRatings, setAgeRatings] = useState([
        { value: 'all', label: 'All Ratings' },
        { value: 'G', label: 'G' },
        { value: 'PG', label: 'PG' },
        { value: 'PG-13', label: 'PG-13' },
        { value: 'R', label: 'R' },
        { value: 'NC-17', label: 'NC-17' },
        { value: 'TV-Y', label: 'TV-Y' },
        { value: 'TV-Y7', label: 'TV-Y7' },
        { value: 'TV-G', label: 'TV-G' },
        { value: 'TV-PG', label: 'TV-PG' },
        { value: 'TV-14', label: 'TV-14' },
        { value: 'TV-MA', label: 'TV-MA' },
        { value: 'Not Rated', label: 'Not Rated' }
    ]);

    // Get the current profile from localStorage or use the first profile
    useEffect(() => {
        const currentProfile = localStorage.getItem('currentProfile');
        if (currentProfile) {
            setSelectedProfile(JSON.parse(currentProfile));
        } else if (profiles && profiles.length > 0) {
            setSelectedProfile(profiles[0]);
            localStorage.setItem('currentProfile', JSON.stringify(profiles[0]));
        }
    }, [profiles]);

    // Initial data fetch to get available media and populate filter options
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch all media to populate filter options
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media`, {
                    params: { limit: 100 }
                });
                
                if (response.data.results && response.data.results.length > 0) {
                    // Extract unique genres, languages, and ratings
                    const uniqueGenres = new Set();
                    const uniqueLanguages = new Set();
                    const uniqueRatings = new Set();
                    
                    response.data.results.forEach(item => {
                        if (item.genres && Array.isArray(item.genres)) {
                            item.genres.forEach(genre => uniqueGenres.add(genre));
                        }
                        if (item.originalLanguage) {
                            uniqueLanguages.add(item.originalLanguage);
                        }
                        if (item.maturityRating) {
                            uniqueRatings.add(item.maturityRating);
                        }
                    });
                    
                    console.log('Unique genres found:', [...uniqueGenres]);
                    console.log('Unique languages found:', [...uniqueLanguages]);
                    console.log('Unique ratings found:', [...uniqueRatings]);
                    
                    // Update filter options with actual data from API
                    // Keep 'all' option at the top
                    setGenres([
                        { value: 'all', label: 'All Genres' },
                        ...[...uniqueGenres].map(genre => ({ value: genre, label: genre }))
                    ]);
                    
                    const languageMap = {
                        'en': 'English',
                        'fr': 'French',
                        'es': 'Spanish',
                        'de': 'German',
                        'ja': 'Japanese',
                        'ko': 'Korean',
                        'zh': 'Chinese',
                        'hi': 'Hindi',
                        'he': 'Hebrew',
                        'ar': 'Arabic',
                        'ru': 'Russian',
                        'it': 'Italian',
                        'pt': 'Portuguese'
                    };
                    
                    setLanguages([
                        { value: 'all', label: 'All Languages' },
                        ...[...uniqueLanguages].map(lang => ({ 
                            value: lang, 
                            label: languageMap[lang] || lang.toUpperCase() 
                        }))
                    ]);
                    
                    setAgeRatings([
                        { value: 'all', label: 'All Ratings' },
                        ...[...uniqueRatings].map(rating => ({ value: rating, label: rating }))
                    ]);
                    
                    // Also set the initial media
                    setMedia(response.data.results);
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
        // We should always fetch data when filter changes, even if all filters are 'all'
        // Remove this condition to ensure filters reset properly
        // if (genreFilter === 'all' && languageFilter === 'all' && ageRatingFilter === 'all') {
        //     return;
        // }
        
        const fetchFilteredMedia = async () => {
            try {
                setIsLoading(true);
                
                // Simple approach to fetch all media directly from endpoint
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media`, {
                    params: {
                        limit: 100
                    }
                });
                
                if (response.data.results && response.data.results.length > 0) {                    
                    // Apply client-side filtering based on selected filters
                    let filteredResults = response.data.results;
                    
                    // Only apply filtering if at least one filter is not 'all'
                    if (genreFilter !== 'all' || languageFilter !== 'all' || ageRatingFilter !== 'all') {
                        filteredResults = response.data.results.filter(item => {
                            // Skip items without proper data for filtering
                            if (!item) return false;
                            
                            // Genre filter
                            let genreMatch = genreFilter === 'all';
                            if (!genreMatch && item.genres && Array.isArray(item.genres)) {
                                genreMatch = item.genres.some(genre => 
                                    genre.toLowerCase() === genreFilter.toLowerCase());
                            }
                            
                            // Language filter
                            let languageMatch = languageFilter === 'all';
                            if (!languageMatch && item.originalLanguage) {
                                languageMatch = item.originalLanguage.toLowerCase() === languageFilter.toLowerCase();
                            }
                            
                            // Age rating filter
                            let ratingMatch = ageRatingFilter === 'all';
                            if (!ratingMatch && item.maturityRating) {
                                ratingMatch = item.maturityRating === ageRatingFilter;
                            }
                            
                            return genreMatch && languageMatch && ratingMatch;
                        });
                        
                        console.log(`Filtering applied: ${response.data.results.length} items filtered to ${filteredResults.length} items`);
                        console.log('Filter criteria:', { genreFilter, languageFilter, ageRatingFilter });
                    } else {
                        // If all filters are 'all', use all results
                        console.log('All filters set to "All" - showing all media');
                    }
                    
                    setMedia(filteredResults);
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
    }, [genreFilter, languageFilter, ageRatingFilter]);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        localStorage.setItem('currentProfile', JSON.stringify(profile));
        handleProfileMenuClose();
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
    };

    const handleLanguageChange = (event) => {
        setLanguageFilter(event.target.value);
    };

    const handleAgeRatingChange = (event) => {
        setAgeRatingFilter(event.target.value);
    };
    
    // Reset all filters to 'all'
    const handleResetFilters = () => {
        setGenreFilter('all');
        setLanguageFilter('all');
        setAgeRatingFilter('all');
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
        console.log('Media clicked:', media);
        // Prepare media object for MoreInfo component
        const preparedMedia = prepareMediaForMoreInfo(media);
        // Open MoreInfo component
        setSelectedMedia(preparedMedia);
        setMoreInfoOpen(true);
    };
    
    // Prepare media object for MoreInfo component by ensuring all required properties exist
    const prepareMediaForMoreInfo = (media) => {
        if (!media) return null;
        
        // Create a copy to avoid modifying the original
        const prepared = { ...media };
        
        // Ensure image properties are set
        prepared.posterPath = prepared.posterPath || getImageUrl(prepared);
        
        // Set backdrop image (MoreInfo uses this for the background)
        if (!prepared.backdropPath && prepared.additionalImages && prepared.additionalImages.length > 0) {
            prepared.backdropPath = prepared.additionalImages[0];
        } else if (!prepared.backdropPath) {
            // Use poster as fallback if no backdrop is available
            prepared.backdropPath = prepared.posterPath;
        }
        
        // Ensure genres are an array
        if (!prepared.genres || !Array.isArray(prepared.genres)) {
            prepared.genres = [];
        }
        
        // Ensure types and formats that MoreInfo expects
        if (prepared.releaseDate && typeof prepared.releaseDate === 'string') {
            prepared.releaseDate = new Date(prepared.releaseDate);
        }
        
        // Ensure cast is an array
        if (!prepared.cast || !Array.isArray(prepared.cast)) {
            prepared.cast = [];
        }
        
        // Ensure seasonData is an array
        if (!prepared.seasonData || !Array.isArray(prepared.seasonData)) {
            prepared.seasonData = [];
        }
        
        console.log('Prepared media for MoreInfo:', prepared);
        return prepared;
    };
    
    const handleMoreInfoClose = () => {
        setMoreInfoOpen(false);
    };

    // Check if a media item was recently added (within the last 30 days)
    const isRecentlyAdded = (releaseDate) => {
        if (!releaseDate) return false;
        
        const released = new Date(releaseDate);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        return released >= thirtyDaysAgo;
    };

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

    // Simplified function based on how other components handle images
    const getImageUrl = (item) => {
        if (!item) return 'https://via.placeholder.com/300x450?text=No+Image';
        
        // Try different image properties in order of preference
        if (item.posterPath) return item.posterPath;
        if (item.backdropPath) return item.backdropPath;
        if (item.additionalImages && item.additionalImages.length > 0) return item.additionalImages[0];
        if (item.imageUrl) return item.imageUrl;
        if (item.posterUrl) return item.posterUrl;
        if (item.backdropUrl) return item.backdropUrl;
        
        // Fallbacks
        if (item.img) return item.img;
        
        // Check if there's a poster object with a path
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
        return 'https://via.placeholder.com/300x450?text=No+Image';
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

    return (
        <>
            <CssBaseline />
            <Box sx={{ bgcolor: '#141414', minHeight: '100vh', color: 'white' }}>
                {/* Navbar */}
                <AppBar position="fixed" sx={{ 
                    bgcolor: 'rgba(20, 20, 20, 0.8)', 
                    boxShadow: 'none',
                    backdropFilter: 'blur(8px)'
                }}>
                    <Toolbar>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <img 
                                src={NetflixLogo} 
                                alt="Netflix" 
                                style={{ height: '25px', marginRight: '20px', cursor: 'pointer' }} 
                                onClick={() => navigateTo('/home')}
                            />
                            <NavButton onClick={() => navigateTo('/home')}>Home</NavButton>
                            <NavButton onClick={() => navigateTo('/tvshows')}>TV Shows</NavButton>
                            <NavButton onClick={() => navigateTo('/movies')}>Movies</NavButton>
                            <NavButton onClick={() => navigateTo('/browse')} sx={{ color: '#ffffff', fontWeight: 'bold' }}>Browse</NavButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton color="inherit">
                                <SearchIcon />
                            </IconButton>
                            
                            <Box sx={{ ml: 2 }}>
                                {selectedProfile && (
                                    <IconButton
                                        onClick={handleProfileMenuOpen}
                                        sx={{ p: 0 }}
                                    >
                                        <Avatar
                                            src={selectedProfile.avatar}
                                            alt={selectedProfile.name}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                    </IconButton>
                                )}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleProfileMenuClose}
                                    PaperProps={{
                                        sx: {
                                            bgcolor: '#282828',
                                            color: 'white',
                                            minWidth: '200px',
                                            mt: 1
                                        }
                                    }}
                                >
                                    {profiles && profiles.map((profile) => (
                                        <MenuItem 
                                            key={profile._id}
                                            onClick={() => handleProfileSelect(profile)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                py: 1
                                            }}
                                        >
                                            <Avatar src={profile.avatar} alt={profile.name} />
                                            <Typography>{profile.name}</Typography>
                                        </MenuItem>
                                    ))}
                                    <MenuItem 
                                        onClick={handleSwitchProfiles}
                                        sx={{ borderTop: '1px solid #404040', mt: 1, pt: 1 }}
                                    >
                                        Switch Profiles
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Main Content with padding to account for fixed navbar */}
                <Box sx={{ pt: 10 }}>
                    {/* Browse Header and Filters */}
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                            Browse
                        </Typography>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 4, 
                            p: 0, 
                            height: '34px'
                        }}>
                            <Typography sx={{ mr: 2, fontSize: '13px', color: '#aaa' }}>
                                Select Your Preferences
                            </Typography>
                            
                            <FilterSelect size="small">
                                <Select
                                    value={languageFilter}
                                    onChange={handleLanguageChange}
                                    displayEmpty
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: '#282828',
                                                color: 'white',
                                            }
                                        }
                                    }}
                                    renderValue={() => "Original Language"}
                                >
                                    <MenuItem value="all">All Languages</MenuItem>
                                    {languages.filter(lang => lang.value !== 'all').map((language) => (
                                        <MenuItem key={language.value} value={language.value}>
                                            {language.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FilterSelect>
                            
                            <FilterSelect size="small">
                                <Select
                                    value={ageRatingFilter}
                                    onChange={handleAgeRatingChange}
                                    displayEmpty
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: '#282828',
                                                color: 'white',
                                            }
                                        }
                                    }}
                                    renderValue={() => "English"}
                                >
                                    <MenuItem value="all">All Ratings</MenuItem>
                                    {ageRatings.filter(rating => rating.value !== 'all').map((rating) => (
                                        <MenuItem key={rating.value} value={rating.value}>
                                            {rating.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FilterSelect>
                            
                            <Typography sx={{ mx: 2, fontSize: '13px', color: '#aaa' }}>
                                Sort by
                            </Typography>
                            
                            <FilterSelect size="small">
                                <Select
                                    value={genreFilter}
                                    onChange={handleGenreChange}
                                    displayEmpty
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: '#282828',
                                                color: 'white',
                                            }
                                        }
                                    }}
                                    renderValue={() => "Suggestions For You"}
                                >
                                    <MenuItem value="all">All Genres</MenuItem>
                                    {genres.filter(genre => genre.value !== 'all').map((genre) => (
                                        <MenuItem key={genre.value} value={genre.value}>
                                            {genre.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FilterSelect>
                        </Box>
                        
                        {/* Media Grid */}
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: 'red' }} />
                            </Box>
                        ) : media.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6">
                                    No titles found with the selected filters. Try adjusting your filters.
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {media.map((item, index) => {
                                    const imageUrl = getImageUrl(item);
                                    return (
                                        <Grid item xs={6} sm={4} md={3} lg={2} key={item._id || index}>
                                            {index === 0 && console.log('First item image URL:', imageUrl)}
                                            <MediaCard onClick={() => handleMediaClick(item)}>
                                                <MediaImage 
                                                    src={imageUrl} 
                                                    alt={item.title} 
                                                    onError={(e) => {
                                                        console.warn(`Image failed to load for: ${item.title}, URL: ${imageUrl}`);
                                                        // Try to use a transparent pixel instead of text-based placeholder
                                                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                                                    }}
                                                />
                                                <MediaTitle variant="body2">{item.title}</MediaTitle>
                                                {isRecentlyAdded(item.releaseDate) && (
                                                    <RecentlyAddedTag>
                                                        NEW
                                                    </RecentlyAddedTag>
                                                )}
                                            </MediaCard>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Container>
                </Box>
                
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
        </>
    );
} 