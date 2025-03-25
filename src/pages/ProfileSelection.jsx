import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import UserContext from '../context/UserContext';
import ApiService from '../api/api';
import { useNavigate } from 'react-router-dom';

// Profile Avatars
import RedAvatar from '../assets/images/profile1.png';
import BlueAvatar from '../assets/images/profile2.png';
import PurpleAvatar from '../assets/images/profile3.png';
import OrangeAvatar from '../assets/images/profile4.png';
import mummi from '../assets/images/profile5.png';

const avatars = [RedAvatar, BlueAvatar, PurpleAvatar, OrangeAvatar, mummi];

export default function ProfileSelection() {
    const { user, profiles, setProfiles, setProfile } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(null);
    const navigate = useNavigate();

    // Load profiles from backend on component mount
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const response = await ApiService.getProfiles();
                setProfiles(response.data);
            } catch (error) {
                console.error('Error fetching profiles:', error);
            }
        };
        
        fetchProfiles();
    }, [setProfiles]);

    // Handle profile selection
    const handleSelectProfile = (profile) => {
        // Set current profile in context
        setProfile(profile);
        
        // Navigate to the home page
        navigate('/home');
    };

    // Add new profile
    const addProfile = async () => {
        if (profiles.length >= 5) return;

        // Get unused avatars
        const usedAvatars = profiles.map(profile => profile.avatar);
        const availableAvatars = avatars.filter(avatar => !usedAvatars.includes(avatar));
        
        // If all avatars are used, just pick a random one
        const randomAvatar = availableAvatars.length > 0 
            ? availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
            : avatars[Math.floor(Math.random() * avatars.length)];
        
        const newProfile = {
            name: `Profile ${profiles.length + 1}`,
            avatar: randomAvatar,
        };

        try {
            const response = await ApiService.addProfile(newProfile);
            setProfiles(response.data);
        } catch (error) {
            console.error('Error adding profile:', error);
        }
    };

    // Delete profile
    const deleteProfile = async (id) => {
        try {
            const response = await ApiService.deleteProfile(id);
            setProfiles(response.data.profiles);
        } catch (error) {
            console.error('Error deleting profile:', error);
        }
    };

    // Handle double click to edit
    const handleDoubleClick = (id) => {
        setIsEditing(id);
    };

    // Handle key press for editing
    const handleKeyPress = async (e, id) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newName = e.target.innerText.trim();
            if (newName) {
                try {
                    const response = await ApiService.updateProfileName(id, newName);
                    setProfiles(response.data);
                } catch (error) {
                    console.error('Error updating profile name:', error);
                }
            }
            setIsEditing(null);
        }
    };

    // Handle blur for editing
    const handleBlur = async (e, id) => {
        if (isEditing === id) {
            const newName = e.target.innerText.trim();
            if (newName) {
                try {
                    const response = await ApiService.updateProfileName(id, newName);
                    setProfiles(response.data);
                } catch (error) {
                    console.error('Error updating profile name:', error);
                }
            }
            setIsEditing(null);
        }
    };

    return (
        <Box sx={{ 
            textAlign: 'center', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'linear-gradient(to bottom, #000000, #141414)',
            margin: 0,
            padding: 0,
            width: '100%',
            overflow: 'hidden'
        }}>
            <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 'bold' }}>Who's watching?</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                {profiles.map(profile => (
                    <Box 
                        key={profile._id} 
                        sx={{ 
                            position: 'relative',
                            '&:hover .delete-icon': {
                                opacity: 1
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'relative',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.2s'
                                }
                            }}
                            onClick={() => handleSelectProfile(profile)}
                        >
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                style={{ 
                                    width: 100, 
                                    height: 100, 
                                    borderRadius: 4, 
                                    border: '2px solid transparent',
                                }}
                            />
                            <IconButton
                                className="delete-icon"
                                sx={{ 
                                    position: 'absolute', 
                                    top: -10, 
                                    right: -10, 
                                    color: 'white', 
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,0,0,0.7)',
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProfile(profile._id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography
                            contentEditable={isEditing === profile._id}
                            suppressContentEditableWarning
                            onDoubleClick={() => handleDoubleClick(profile._id)}
                            onKeyDown={(e) => handleKeyPress(e, profile._id)}
                            onBlur={(e) => handleBlur(e, profile._id)}
                            sx={{ 
                                color: '#fff', 
                                mt: 1, 
                                fontSize: '0.9rem',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                backgroundColor: isEditing === profile._id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                outline: 'none'
                            }}
                        >
                            {profile.name}
                        </Typography>
                    </Box>
                ))}

                {/* Add Profile Button (Hidden if 5 profiles exist) */}
                {profiles.length < 5 && (
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s'
                            }
                        }}
                        onClick={addProfile}
                    >
                        <IconButton 
                            sx={{ 
                                color: '#666',
                                width: 100,
                                height: 100,
                                '&:hover': {
                                    color: '#fff',
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            <AddCircleOutlineIcon sx={{ fontSize: 60 }} />
                        </IconButton>
                        <Typography sx={{ color: '#666', mt: 1, fontSize: '0.9rem' }}>
                            Add Profile
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
