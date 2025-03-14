import React from 'react';
import { Box } from '@mui/material';
import SignUpForm from '../components/SignUpForm';
import SignInBack from '../assets/images/signinback.jpeg';
import NetflixLogo from '../assets/images/netflixlogo.png';
import Footer from '../components/Footer';

const backgroundStyles = {
    width: '100%',
    backgroundImage: `url(${SignInBack})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
};

export default function SignUpPage() {
    return (
        <Box sx={backgroundStyles}>
            {/* Dark Overlay */}
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
                    top: '30px',
                    left: '60px',
                    zIndex: 2,
                }}
            >
                <img
                    src={NetflixLogo}
                    alt="Netflix"
                    style={{
                        width: '160px',
                        height: 'auto',
                    }}
                />
            </Box>

            {/* SignUp Form - Positioned Higher */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start', // Moves form higher
                    flex: 1,
                    marginTop: '100px', // Moves form up
                    marginBottom: '50px'
                }}
            >
                <SignUpForm />
            </Box>

            {/* Footer - Stays at Bottom */}
            <Box sx={{ width: '100%', zIndex: 2, flexShrink: 0 }}>
                <Footer />
            </Box>
        </Box>
    );
}
