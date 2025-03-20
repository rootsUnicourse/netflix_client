import React, { createContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../api/api';
import Cookies from 'js-cookie';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistLoaded, setWatchlistLoaded] = useState(false);

    // Memoize fetchWatchlist to prevent recreation on every render
    const fetchWatchlist = useCallback(async () => {
        if (!user) return;
        
        try {
            console.log('Fetching watchlist for user:', user._id);
            const { data } = await ApiService.getWatchlist();
            console.log('Watchlist data received:', data);
            setWatchlist(data);
            setWatchlistLoaded(true);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            // Don't reset watchlist on error to keep any cached data
        }
    }, [user]);

    // Load user from local storage on initial mount
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(storedUser);
            fetchProfiles();
            fetchWatchlist();
        }
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
    
    // Fetch watchlist only when user changes or after specific watchlist operations
    useEffect(() => {
        if (user && !watchlistLoaded) {
            fetchWatchlist();
        }
    }, [user, fetchWatchlist, watchlistLoaded]);

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
        try {
            console.log('Adding to watchlist:', mediaId);
            const { data } = await ApiService.addToWatchlist(mediaId);
            console.log('Updated watchlist:', data);
            setWatchlist(data);
            return true;
        } catch (error) {
            console.error('Error adding to watchlist:', error.response?.data || error);
            return false;
        }
    };

    // Remove from watchlist
    const removeFromWatchlist = async (mediaId) => {
        try {
            console.log('Removing from watchlist:', mediaId);
            const { data } = await ApiService.removeFromWatchlist(mediaId);
            console.log('Updated watchlist after removal:', data);
            setWatchlist(data);
            return true;
        } catch (error) {
            console.error('Error removing from watchlist:', error.response?.data || error);
            return false;
        }
    };

    // Check if media is in watchlist
    const isInWatchlist = (mediaId) => {
        return watchlist.some(item => item._id === mediaId);
    };

    // Force refresh watchlist - use this when needed externally
    const refetchWatchlist = () => {
        setWatchlistLoaded(false); // This will trigger the useEffect to fetch again
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
            logout 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
