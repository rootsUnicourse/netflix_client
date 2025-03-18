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
    CssBaseline
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import CoverPhotoSection from '../components/CoverPhotoSection';
import NewOnNetflix from '../components/NewOnNetflix';
import TopShowsInIsrael from '../components/TopShowsInIsrael';
import UserReviews from '../components/UserReviews';
import TopRatedMedia from '../components/TopRatedMedia';
import AnimationMedia from '../components/AnimationMedia';
import WatchlistMedia from '../components/WatchlistMedia';
import Footer from '../components/Footer';

// Netflix logo will be provided by the user
import NetflixLogo from '../assets/images/netflixlogo.png';

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

export default function TVShows() {
    const { user, profiles } = useContext(UserContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [featuredMedia, setFeaturedMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Fetch featured TV Shows for the cover section
    useEffect(() => {
        const fetchFeaturedMedia = async () => {
            try {
                setIsLoading(true);
                // Fetch newest TV shows - add type=tv parameter to only get TV shows
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/media`, {
                    params: {
                        limit: 4,
                        sort: 'releaseDate',
                        order: 'desc',
                        type: 'tv'  // Filter to only get TV shows
                    }
                });

                if (response.data.results && response.data.results.length > 0) {
                    setFeaturedMedia(response.data.results);
                    console.log('Fetched newest TV shows:', response.data.results);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching featured TV shows:', error);
                setIsLoading(false);
            }
        };

        fetchFeaturedMedia();
    }, []);

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
        handleProfileMenuClose();
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
            <CssBaseline /> {/* Ensures consistent styling and removes default margins */}
            <AppBar
                position="fixed"
                sx={{
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    transition: 'background-color 0.3s',
                    '&.scrolled': {
                        backgroundColor: '#141414',
                    }
                }}
            >
                <Toolbar sx={{ padding: { xs: '0 16px', sm: '0 40px' } }}>
                    {/* Netflix Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 0, md: 0 }, mr: { xs: 2, md: 4 } }}>
                        <img
                            src={NetflixLogo}
                            alt="Netflix"
                            style={{ height: '32px', cursor: 'pointer' }}
                            onClick={() => navigate('/home')}
                        />
                    </Box>

                    {/* Navigation Links - Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <NavButton onClick={() => navigate('/home')}>Home</NavButton>
                        <NavButton onClick={() => navigate('/tvshows')} sx={{ fontWeight: 'bold', color: 'white' }}>TV Shows</NavButton>
                        <NavButton>Movies</NavButton>
                        <NavButton>New & Popular</NavButton>
                        <NavButton onClick={() => document.getElementById('watchlist-section').scrollIntoView({ behavior: 'smooth' })}>
                            My List
                        </NavButton>
                        <NavButton>Browse</NavButton>
                    </Box>

                    {/* Navigation Links - Mobile (Dropdown) */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
                        <NavButton>Browse</NavButton>
                    </Box>

                    {/* Right side - Search and Profile */}
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <IconButton color="inherit" sx={{ color: 'white' }}>
                            <SearchIcon />
                        </IconButton>

                        {/* Profile Avatar */}
                        {selectedProfile && (
                            <IconButton
                                onClick={handleProfileMenuOpen}
                                sx={{ ml: 2 }}
                            >
                                <Avatar
                                    src={selectedProfile.avatar}
                                    alt={selectedProfile.name}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        border: '1px solid #333'
                                    }}
                                />
                            </IconButton>
                        )}

                        {/* Profile Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleProfileMenuClose}
                            PaperProps={{
                                sx: {
                                    bgcolor: 'rgba(0,0,0,0.9)',
                                    color: 'white',
                                    border: '1px solid #333',
                                    minWidth: '200px',
                                    mt: 1,
                                    '& .MuiList-root': {
                                        padding: '8px 0',
                                    }
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {profiles && profiles.map(profile => (
                                <MenuItem
                                    key={profile._id}
                                    onClick={() => handleProfileSelect(profile)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    <Avatar
                                        src={profile.avatar}
                                        alt={profile.name}
                                        sx={{ width: 32, height: 32, mr: 2 }}
                                    />
                                    <Typography variant="body2">{profile.name}</Typography>
                                </MenuItem>
                            ))}
                            <MenuItem
                                onClick={handleSwitchProfiles}
                                sx={{
                                    borderTop: '1px solid #333',
                                    mt: 1,
                                    pt: 1,
                                    padding: '8px 16px',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <Typography variant="body2">Switch Profiles</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Cover Photo Section */}
            {!isLoading && featuredMedia.length > 0 && (
                <CoverPhotoSection featuredMediaList={featuredMedia} />
            )}

            {/* Main Content Container */}
            <Container maxWidth={false} sx={{ pt: 0, px: { xs: 0 }, overflowX: 'hidden' }}>
                {/* Rows */}
                <Box sx={{ mt: 4, mb: 2, px: 4 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold', 
                            color: 'white' 
                        }}
                    >
                        TV Shows
                    </Typography>
                </Box>
                
                {/* Modified components to only show TV shows */}
                <NewOnNetflix tvOnly={true} />
                <TopShowsInIsrael />
                <TopRatedMedia mediaType="tv" />
                <UserReviews mediaType="tv" />
                <AnimationMedia mediaType="tv" />
                {/* Watchlist Section - filtered for TV shows */}
                <Box id="watchlist-section">
                    <WatchlistMedia mediaType="tv" />
                </Box>
            </Container>
            
            {/* Footer */}
            <Footer />
        </Box>
    );
} 