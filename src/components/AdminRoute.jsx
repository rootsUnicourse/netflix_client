import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = () => {
    const { user, isAdmin } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    // Add a small delay to ensure user context is fully loaded
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    // Show loading state while checking
    if (loading) {
        return (
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                bgcolor: '#141414',
                color: 'white' 
            }}>
                <CircularProgress color="primary" />
                <Box sx={{ ml: 2 }}>
                    Checking authorization...
                </Box>
            </Box>
        );
    }

    // Check if user is logged in
    if (!user) {
        console.log('AdminRoute: No user found, redirecting to login');
        return <Navigate to="/" replace />;
    }

    // If user doesn't have admin role, redirect to home
    if (!isAdmin()) {
        console.log('AdminRoute: User is not admin, redirecting to home');
        return <Navigate to="/home" replace />;
    }

    // User is admin, render the requested route
    console.log('AdminRoute: User is admin, rendering protected admin content');
    return <Outlet />;
};

export default AdminRoute; 