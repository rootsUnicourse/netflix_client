import React, { createContext, useState, useEffect } from 'react';
import ApiService from '../api/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);

    // Load user & profiles from local storage on initial mount
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(storedUser);
            fetchProfiles();
        }
    }, []);

    // Fetch profiles from API when user changes
    useEffect(() => {
        if (user) {
            fetchProfiles();
        }
    }, [user]);

    // Fetch profiles from API and store in localStorage
    const fetchProfiles = async () => {
        try {
            const { data } = await ApiService.getProfiles();
            setProfiles(data);
            localStorage.setItem('profiles', JSON.stringify(data)); // Store locally
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    // Add new profile
    const addNewProfile = async (name, avatar) => {
        try {
            const { data } = await ApiService.addProfile({ name, avatar });
            setProfiles(data);
            localStorage.setItem('profiles', JSON.stringify(data)); // Store updated profiles locally
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
            localStorage.setItem('profiles', JSON.stringify(updatedProfiles)); // Store updated list
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
            localStorage.setItem('profiles', JSON.stringify(updatedProfiles)); // Store updated list
        } catch (error) {
            console.error('Error renaming profile:', error);
        }
    };

    // Logout user (clears storage and resets state)
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('profiles');
        setUser(null);
        setProfiles([]);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser, 
            profiles, 
            setProfiles, 
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
