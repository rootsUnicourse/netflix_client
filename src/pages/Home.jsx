import React, { useContext, useState, useEffect } from 'react';
import {
    Box,
    Container,
    CssBaseline
} from '@mui/material';
import UserContext from '../context/UserContext';
import ApiService from '../api/api';

// Components
import Navbar from '../components/Navbar';
import CoverPhotoSection from '../components/CoverPhotoSection';
import NewOnNetflix from '../components/NewOnNetflix';
import TopShowsInIsrael from '../components/TopShowsInIsrael';
import UserReviews from '../components/UserReviews';
import TopRatedMedia from '../components/TopRatedMedia';
import AnimationMedia from '../components/AnimationMedia';
import ActionMedia from '../components/ActionMedia';
import WatchlistMedia from '../components/WatchlistMedia';
import MatchForYou from '../components/MatchForYou';
import Footer from '../components/Footer';

export default function Home() {
    const { profiles } = useContext(UserContext);
    const [featuredMedia, setFeaturedMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get the current profile from sessionStorage or use the first profile
    useEffect(() => {
        const currentProfile = sessionStorage.getItem('currentProfile');
        if (currentProfile) {
            // No need to set selected profile since it's not used
            // Just use it for sessionStorage
        } else if (profiles && profiles.length > 0) {
            sessionStorage.setItem('currentProfile', JSON.stringify(profiles[0]));
        }
    }, [profiles]);

    // Fetch featured media for the cover section
    useEffect(() => {
        const fetchFeaturedMedia = async () => {
            try {
                setIsLoading(true);
                // Use the new TMDB endpoint
                const response = await ApiService.getTMDBPopularMedia('all', 4);
                console.log('API Response:', response);
                if (response && response.data) {
                    setFeaturedMedia(response.data);
                    console.log('Featured Media State:', response.data);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching featured media:', error);
                setIsLoading(false);
            }
        };

        fetchFeaturedMedia();
    }, []);

    // Add a console log to see when featuredMedia changes
    useEffect(() => {
        console.log('Featured Media Updated:', featuredMedia);
    }, [featuredMedia]);

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

            {/* Cover Photo Section */}
            {!isLoading && featuredMedia.length > 0 && (
                <CoverPhotoSection 
                    featuredMediaList={featuredMedia} 
                    key={featuredMedia[0]?.id} // Add key to force re-render when data changes
                />
            )}

            {/* Main Content Container */}
            <Container maxWidth={false} sx={{ pt: 0, px: { xs: 0 }, overflowX: 'hidden' }}>
                {/* Rows */}
                <MatchForYou />
                <NewOnNetflix />
                <TopShowsInIsrael />
                <UserReviews />
                <TopRatedMedia />
                <AnimationMedia />
                <ActionMedia />
                {/* Watchlist Section */}
                <Box id="watchlist-section">
                    <WatchlistMedia />
                </Box>
            </Container>
            
            {/* Footer */}
            <Footer />
        </Box>
    );
} 