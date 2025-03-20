import React, { useContext, useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    CssBaseline
} from '@mui/material';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from '../components/Navbar';
import CoverPhotoSection from '../components/CoverPhotoSection';
import NewOnNetflix from '../components/NewOnNetflix';
import TopShowsInIsrael from '../components/TopShowsInIsrael';
import UserReviews from '../components/UserReviews';
import TopRatedMedia from '../components/TopRatedMedia';
import AnimationMedia from '../components/AnimationMedia';
import WatchlistMedia from '../components/WatchlistMedia';
import Footer from '../components/Footer';

export default function TVShows() {
    const { profiles } = useContext(UserContext);
    const navigate = useNavigate();
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [featuredMedia, setFeaturedMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
            
            {/* Use shared Navbar component with transparent background */}
            <Navbar transparent={true} />

            {/* Title - positioned at the top left */}
            <Box sx={{ 
                position: 'absolute', 
                top: { xs: 70, sm: 80 }, 
                left: 40, 
                zIndex: 5 
            }}>
                <Typography 
                    variant="h2" 
                    sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                >
                    TV Shows
                </Typography>
            </Box>

            {/* Cover Photo Section */}
            {!isLoading && featuredMedia.length > 0 && (
                <CoverPhotoSection featuredMediaList={featuredMedia} />
            )}

            {/* Main Content Container */}
            <Container maxWidth={false} sx={{ pt: 0, px: { xs: 0 }, overflowX: 'hidden' }}>
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