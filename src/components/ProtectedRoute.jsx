// client/src/components/ProtectedRoute.js
import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import UserContext from '../context/UserContext';

const ProtectedRoute = () => {
    const { user } = useContext(UserContext);
    const location = useLocation();
    
    // Check if we're in a protected route
    const isProtectedRoute = location.pathname !== '/' && location.pathname !== '/signup';
    
    // If the user is trying to access a protected route
    if (isProtectedRoute) {
        // If we recognize the user (they're logged in)
        if (user) {
            // Allow access to the route by returning the Outlet
            return <Outlet />;
        } else {
            // If we don't recognize the user, redirect to login
            console.log('User not recognized. Redirecting to login page.');
            return <Navigate to="/" replace />;
        }
    }
    
    // For non-protected routes, just render the route
    return <Outlet />;
};

export default ProtectedRoute;
