// client/src/pages/SignUpPage.js
import React from 'react';
import { Box } from '@mui/material';
import SignUpForm from '../components/SignUpForm';
import SignInBack from '../assets/images/signinback.jpeg';
import NetflixLogo from '../assets/images/netflixlogo.png';
import Footer from '../components/Footer';

const backgroundStyles = {
    width: '100%',
    height: '100vh',
    backgroundImage: `url(${SignInBack})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
};

export default function SignUpPage() {
    return (
        <Box sx={backgroundStyles}>
            {/* A dark overlay to simulate Netflix's gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                }}
            />

            {/* Netflix Logo - Positioned at the Top Left */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '20px', // Distance from top
                    left: '120px', // Distance from left
                    zIndex: 2,
                }}
            >
                <img
                    src={NetflixLogo}
                    alt="Netflix"
                    style={{
                        width: '150px', // Adjust logo size
                        height: 'auto',
                    }}
                />
            </Box>

            {/* Centered SignUp Form under the Netflix Logo */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '40px',
                    marginBottom: '40px'
                }}
            >
                <SignUpForm />
            </Box>
            {/* Footer Below Sign Up Form */}
            <Box sx={{ width: '100%' }}>
                <Footer />
            </Box>
        </Box>
    );
}
