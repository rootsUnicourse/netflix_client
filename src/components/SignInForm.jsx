import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, FormControlLabel, Checkbox } from '@mui/material';
import { login } from '../api/api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function SignInForm() {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 🔹 Check if user is already remembered in cookies on component mount
    useEffect(() => {
        const storedUser = Cookies.get('user');
        if (storedUser) {
            const { emailOrPhone, password } = JSON.parse(storedUser);
            setEmailOrPhone(emailOrPhone);
            setPassword(password);
            navigate('/dashboard'); // Redirect immediately if cookie exists
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data } = await login({ emailOrPhone, password });

            // If "Remember Me" is checked, store credentials in a cookie for 1 hour
            if (rememberMe) {
                Cookies.set('user', JSON.stringify({ emailOrPhone, password }), { expires: 1 / 24 });
            }

            navigate('/dashboard'); // Redirect after successful login
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid login credentials.');
        }
    };

    return (
        <Card
            sx={{
                width: 400,
                backgroundColor: 'rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.5)',
            }}
        >
            <CardContent sx={{ width: '100%' }}>
                {/* Sign In Heading */}
                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        fontWeight: 400,
                        fontFamily: 'ABeeZee, sans-serif',
                        color: '#fff',
                        textAlign: 'left',
                        width: '100%',
                    }}
                >
                    Sign In
                </Typography>

                {/* Form Container */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        label="Email or phone number"
                        variant="filled"
                        fullWidth
                        required
                        placeholder="Enter your email or phone"
                        sx={inputStyles}
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        variant="filled"
                        type="password"
                        fullWidth
                        required
                        placeholder="Enter your password"
                        sx={inputStyles}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Remember Me Checkbox */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                sx={{
                                    color: '#fff',
                                    '&.Mui-checked': {
                                        color: '#e50914',
                                    },
                                }}
                            />
                        }
                        label={<Typography sx={{ color: '#BCBCBC', fontFamily: 'ABeeZee, sans-serif' }}>Remember me</Typography>}
                        sx={{ mb: 2 }}
                    />

                    {/* Error Message */}
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    {/* Sign In Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: 'red',
                            color: '#fff',
                            fontWeight: 400,
                            fontFamily: 'ABeeZee, sans-serif',
                            mt: 1,
                            mb: 2,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#e50914',
                            },
                        }}
                    >
                        Sign In
                    </Button>

                    {/* Sign Up Link */}
                    <Typography
                        sx={{
                            color: '#BCBCBC',
                            fontFamily: 'ABeeZee, sans-serif',
                            textAlign: 'left',
                        }}
                    >
                        New to Netflix?{' '}
                        <Box
                            component="span"
                            sx={{ color: '#fff', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => navigate('/signup')}
                        >
                            Sign up now.
                        </Box>
                    </Typography>
                </Box>
                <Box sx={{ width: '100%', marginTop: '20px', marginBottom: '100px' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: 'Netflix Sans, sans-serif',
                            color: '#8C8C8C',
                        }}
                    >
                        This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
                        <a href="/" style={{ color: '#0071eb', textDecoration: 'none' }}>
                            Learn more.
                        </a>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

// Input field styles
const inputStyles = {
    mb: 2,
    '& .MuiFilledInput-root': {
        border: '1px solid #808080',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: '#BCBCBC',
        fontWeight: 400,
        fontFamily: 'ABeeZee, sans-serif',
        borderRadius: '4px',
    },
    '& .MuiInputLabel-root': {
        fontFamily: 'ABeeZee, sans-serif',
        color: '#BCBCBC',
    },
};
