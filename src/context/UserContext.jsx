import React, { createContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../api/api';
import Cookies from 'js-cookie';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistLoaded, setWatchlistLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load current profile from session storage
    useEffect(() => {
        const storedProfile = JSON.parse(sessionStorage.getItem('currentProfile'));
        if (storedProfile) {
            setCurrentProfile(storedProfile);
        }
    }, []);

    // Memoize fetchWatchlist to prevent recreation on every render
    const fetchWatchlist = useCallback(async () => {
        if (!user || !currentProfile) return;
        
        try {
            const { data } = await ApiService.getWatchlist(currentProfile._id);
            setWatchlist(data);
            setWatchlistLoaded(true);
        } catch (error) {
            // Don't reset watchlist on error to keep any cached data
        }
    }, [user, currentProfile]);

    // Load user from local storage on initial mount
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(storedUser);
            fetchProfiles();
        }
        setLoading(false);
    }, []);

    // Fetch profiles from API when user changes
    useEffect(() => {
        if (user) {
            fetchProfiles();
        } else {
            // Clear profiles when user logs out
            setProfiles([]);
        }
    }, [user]);
    
    // Fetch watchlist when user or current profile changes
    useEffect(() => {
        if (user && currentProfile && !watchlistLoaded) {
            fetchWatchlist();
        }
    }, [user, currentProfile, fetchWatchlist, watchlistLoaded]);

    // Fetch profiles from API
    const fetchProfiles = async () => {
        try {
            const { data } = await ApiService.getProfiles();
            setProfiles(data);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            setProfiles([]); // Clear profiles on error
        }
    };

    // Add new profile
    const addNewProfile = async (name, avatar) => {
        try {
            const { data } = await ApiService.addProfile({ name, avatar });
            setProfiles(data);
        } catch (error) {
            console.error('Error adding profile:', error);
        }
    };

    // Delete a profile
    const removeProfile = async (profileId) => {
        try {
            await ApiService.deleteProfile(profileId);
            const updatedProfiles = profiles.filter(profile => profile._id !== profileId);
            setProfiles(updatedProfiles);
        } catch (error) {
            console.error('Error deleting profile:', error);
        }
    };

    // Rename a profile
    const renameProfile = async (profileId, newName) => {
        try {
            await ApiService.updateProfileName(profileId, newName);
            const updatedProfiles = profiles.map(profile =>
                profile._id === profileId ? { ...profile, name: newName } : profile
            );
            setProfiles(updatedProfiles);
        } catch (error) {
            console.error('Error renaming profile:', error);
        }
    };

    // Add to watchlist
    const addToWatchlist = async (mediaId) => {
        if (!currentProfile) {
            console.error('No profile selected');
            // Fallback to first profile if available
            if (profiles.length > 0) {
                const firstProfile = profiles[0];
                setProfile(firstProfile);
                try {
                    const { data } = await ApiService.addToWatchlist(mediaId, firstProfile._id);
                    
                    // Force a complete refresh of watchlist data
                    const fullWatchlistResponse = await ApiService.getWatchlist(firstProfile._id);
                    setWatchlist(fullWatchlistResponse.data);
                    
                    return true;
                } catch (error) {
                    console.error('Error adding to watchlist:', error.response?.data || error);
                    return false;
                }
            }
            return false;
        }
        
        try {
            const { data } = await ApiService.addToWatchlist(mediaId, currentProfile._id);
            
            // Force a complete refresh of watchlist data
            const fullWatchlistResponse = await ApiService.getWatchlist(currentProfile._id);
            setWatchlist(fullWatchlistResponse.data);
            
            return true;
        } catch (error) {
            console.error('Error adding to watchlist:', error.response?.data || error);
            return false;
        }
    };

    // Remove from watchlist
    const removeFromWatchlist = async (mediaId) => {
        if (!currentProfile) {
            console.error('No profile selected');
            // Fallback to first profile if available
            if (profiles.length > 0) {
                const firstProfile = profiles[0];
                setProfile(firstProfile);
                try {
                    const { data } = await ApiService.removeFromWatchlist(mediaId, firstProfile._id);
                    
                    // Force a complete refresh of watchlist data
                    const fullWatchlistResponse = await ApiService.getWatchlist(firstProfile._id);
                    setWatchlist(fullWatchlistResponse.data);
                    
                    return true;
                } catch (error) {
                    console.error('Error removing from watchlist:', error.response?.data || error);
                    return false;
                }
            }
            return false;
        }
        
        try {
            const { data } = await ApiService.removeFromWatchlist(mediaId, currentProfile._id);
            
            // Force a complete refresh of watchlist data
            const fullWatchlistResponse = await ApiService.getWatchlist(currentProfile._id);
            setWatchlist(fullWatchlistResponse.data);
            
            return true;
        } catch (error) {
            console.error('Error removing from watchlist:', error.response?.data || error);
            return false;
        }
    };

    // Check if media is in watchlist
    const isInWatchlist = (mediaId) => {
        if (!watchlist || !watchlist.length) return false;
        
        return watchlist.some(item => {
            // Check different ways the ID might be represented
            if (item._id === mediaId) return true;
            if (item._id && mediaId && item._id.toString() === mediaId.toString()) return true;
            if (typeof item === 'string' && item === mediaId) return true;
            return false;
        });
    };

    // Force refresh watchlist - use this when needed externally
    const refetchWatchlist = () => {
        setWatchlistLoaded(false); // This will trigger the useEffect to fetch again
    };

    // Set current profile
    const setProfile = (profile) => {
        sessionStorage.setItem('currentProfile', JSON.stringify(profile));
        setCurrentProfile(profile);
        setWatchlistLoaded(false); // Refresh watchlist when profile changes
    };

    // Get current profile
    const getCurrentProfile = () => {
        return currentProfile;
    };

    // Login user - this function will store user data with role information
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const { data } = await ApiService.login(email, password);
            
            // Store user and token in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Set user state
            setUser(data.user);
            
            return data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Authentication failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // Register user - this function will also store user data with role information
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            
            const { data } = await ApiService.register(userData);
            
            // Store user and token in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Set user state
            setUser(data.user);
            
            return data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // Logout user (clears storage and resets state)
    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Clear sessionStorage
        sessionStorage.removeItem('currentProfile');
        
        // Clear cookies
        Cookies.remove('user');
        
        // Reset all state
        setUser(null);
        setProfiles([]);
        setWatchlist([]);
        setWatchlistLoaded(false);
        setCurrentProfile(null);
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    // Get user role 
    const getUserRole = () => {
        return user?.role || 'user';
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser, 
            profiles, 
            setProfiles,
            watchlist,
            addToWatchlist,
            removeFromWatchlist,
            isInWatchlist,
            refetchWatchlist,
            addNewProfile, 
            removeProfile, 
            renameProfile,
            login,
            register,
            logout,
            loading,
            error,
            isAuthenticated: !!user,
            isAdmin,
            getUserRole,
            currentProfile,
            setProfile,
            getCurrentProfile
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
