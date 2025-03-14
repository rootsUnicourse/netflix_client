import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { signUp } from '../api/api';

export default function SignUpForm() {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Regex for password validation (at least 8 chars, one letter, one number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Validate email/phone uniqueness (this should also be checked in the backend)
        if (!emailOrPhone) {
            setError('Email or phone number is required.');
            return;
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and contain at least one letter and one number.');
            return;
        }

        // Validate role selection
        if (!role) {
            setError('Please select a user role.');
            return;
        }

        try {
            const { data } = await signUp({ emailOrPhone, password, role });
            setSuccessMessage(data.message || 'Registered successfully!');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong. Try again.');
            }
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
                    >
                        Sign Up
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
