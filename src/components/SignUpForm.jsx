import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { signUp, login } from '../api/api';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';

export default function SignUpForm() {
    const navigate = useNavigate();
    const { setUser, logout } = useContext(UserContext);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Regex for password validation (at least 8 chars, one letter, one number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        // Validate email/phone uniqueness (this should also be checked in the backend)
        if (!emailOrPhone) {
            setError('Email or phone number is required.');
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and contain at least one letter and one number.');
            setIsLoading(false);
            return;
        }

        // Validate role selection
        if (!role) {
            setError('Please select a user role.');
            setIsLoading(false);
            return;
        }

        try {
            // First logout to clear any existing user data
            logout();
            
            const { data } = await signUp({ emailOrPhone, password, role });
            console.log('Signup response:', data);
            
            // Store user data and token in localStorage if available
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Update user context
                setUser(data.user);
                
                setSuccessMessage(data.message || 'Registered successfully!');
                
                // Navigate to profiles page after successful signup
                navigate('/profiles');
            } else {
                // If token or user is missing, try to login with the credentials
                try {
                    console.log('Token or user missing, attempting login...');
                    const loginResponse = await login({ emailOrPhone, password });
                    
                    if (loginResponse.data.token && loginResponse.data.user) {
                        localStorage.setItem('token', loginResponse.data.token);
                        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
                        setUser(loginResponse.data.user);
                        
                        setSuccessMessage('Account created and logged in successfully!');
                        navigate('/profiles');
                    } else {
                        // Login also failed, redirect to sign in page
                        setSuccessMessage('Account created! Please sign in.');
                        setTimeout(() => {
                            navigate('/');
                        }, 2000);
                    }
                } catch (loginErr) {
                    console.error('Login after signup failed:', loginErr);
                    setSuccessMessage('Account created! Please sign in.');
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }
            }
        } catch (err) {
            console.error('Signup error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong. Try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            sx={{
                width: 400,
                height: 'auto',
                backgroundColor: 'rgba(0,0,0,0.60)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px',
                borderRadius: '12px',
            }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                }}
            >
                {/* Sign Up Heading */}
                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        fontWeight: '400',
                        fontFamily: 'ABeeZee, sans-serif',
                        color: '#fff',
                        textAlign: 'left',  // 👈 Set text alignment to left
                        width: '100%',       // 👈 Ensures alignment applies correctly
                    }}
                >
                    Sign Up
                </Typography>
                
                {/* Form Container */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {/* Email or Phone Number Input */}
                    <TextField
                        label="Email or phone number"
                        variant="filled"
                        fullWidth
                        required
                        sx={inputStyles}
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                    />

                    {/* Password Input */}
                    <TextField
                        label="Password"
                        variant="filled"
                        type="password"
                        fullWidth
                        required
                        sx={inputStyles}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* User Role Selection */}
                    <FormControl fullWidth variant="filled" sx={inputStyles}>
                        <InputLabel sx={{ color: '#BCBCBC', fontFamily: 'ABeeZee, sans-serif' }}>Role</InputLabel>
                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            sx={{ color: '#BCBCBC', fontFamily: 'ABeeZee, sans-serif' }}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="registered">User</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Error and Success Messages */}
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}
                    {successMessage && (
                        <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                            {successMessage}
                        </Typography>
                    )}

                    {/* Sign Up Button */}
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
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </Button>
                </Box>

                {/* reCAPTCHA Disclaimer */}
                <Box sx={{ textAlign: 'center', width: '100%', marginTop: '100px', marginBottom: '29px' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: 'Netflix Sans, sans-serif',
                            color: '#8C8C8C',
                        }}
                    >
                        This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
                        <a href="#" style={{ color: '#0071eb', textDecoration: 'none' }}>
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
