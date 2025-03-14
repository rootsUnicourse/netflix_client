// client/src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserContext from '../context/UserContext';

const ProtectedRoute = () => {
    const { user } = useContext(UserContext); // Get user from context

    return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
