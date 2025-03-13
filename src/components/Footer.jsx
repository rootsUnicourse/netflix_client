import React from 'react';
import { Box, Typography, Link, Button } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export default function Footer() {
    return (
        <Box
            sx={{
                color: '#b3b3b3',
                fontSize: '13px',
                px: { xs: 4, sm: 6 },
                py: 5,
                maxWidth: '1100px',
                margin: '0 auto',
                backgroundColor: 'rgba(0,0,0,0.60)'
            }}
        >
            {/* QUESTIONS / PHONE */}
            <Typography sx={{ mb: 3, fontWeight: 400, color: '#fff' }}>
                Questions? Call{' '}
                <Link
                    href="tel:1-844-505-2993"
                    sx={{
                        color: '#fff',
                        fontWeight: '400px',
                        textDecoration: 'underline',
                        textDecorationColor: '#fff',
                        textUnderlineOffset: '3px',       // Slightly more offset
                        textDecorationThickness: '2px',   // Increase thickness
                    }}
                >
                    1-844-505-2993
                </Link>
            </Typography>



            {/* 4 COLUMNS */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(120px, auto))',
                        sm: 'repeat(4, minmax(120px, auto))',
                    },
                    rowGap: 2,
                    columnGap: 4,
                    mb: 3, // space below columns
                }}
            >
                {/* COL 1 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Link href="#" sx={linkStyle}>FAQ</Link>
                    <Link href="#" sx={linkStyle}>Privacy</Link>
                </Box>

                {/* COL 2 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Link href="#" sx={linkStyle}>Help Center</Link>
                    <Link href="#" sx={linkStyle}>Cookie Preferences</Link>
                </Box>

                {/* COL 3 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Link href="#" sx={linkStyle}>Netflix Shop</Link>
                    <Link href="#" sx={linkStyle}>Corporate Information</Link>
                </Box>

                {/* COL 4 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Link href="#" sx={linkStyle}>Terms of Use</Link>
                    <Link href="#" sx={linkStyle}>Do Not Sell or Share My Personal Information</Link>
                </Box>
            </Box>

            {/* Ad Choices link BELOW the 4 columns */}
            <Box sx={{ mb: 3 }}>
                <Link href="#" sx={linkStyle}>Ad Choices</Link>
            </Box>

            {/* LANGUAGE SELECT BUTTON BELOW Ad Choices */}
            <Button
                variant="outlined"
                startIcon={<LanguageIcon />}
                sx={{
                    color: '#fff',
                    borderColor: '#fff',
                    textTransform: 'none',
                    fontSize: '13px',
                    '&:hover': {
                        borderColor: '#fff',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                }}
            >
                English
            </Button>
        </Box>
    );
}

// Common link styling
const linkStyle = {
    color: '#fff',
    fontWeight: '400px',
    textDecoration: 'none',
    fontSize: '13px',
    textDecoration: 'underline',
    textDecorationColor: '#fff',
    textUnderlineOffset: '3px',       
    textDecorationThickness: '1px',   
};
