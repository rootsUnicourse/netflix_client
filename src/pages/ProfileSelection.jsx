import React, { useContext } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import UserContext from '../context/UserContext';

// Profile Avatars
import RedAvatar from '../assets/images/profile1.png';
import BlueAvatar from '../assets/images/profile2.png';
import PurpleAvatar from '../assets/images/profile3.png';
import OrangeAvatar from '../assets/images/profile4.png';
import mummi from '../assets/images/profile5.png';

const avatars = [RedAvatar, BlueAvatar, PurpleAvatar, OrangeAvatar,mummi];

export default function ProfileSelection({ onSelectProfile }) {
    const { profiles, setProfiles } = useContext(UserContext);

    // Add new profile
    const addProfile = () => {
        if (profiles.length >= 5) return;

        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        const newProfile = {
            id: Date.now(),
            name: `Profile ${profiles.length + 1}`,
            avatar: randomAvatar,
        };

        setProfiles([...profiles, newProfile]);
    };

    // Delete profile
    const deleteProfile = (id) => {
        setProfiles(profiles.filter(profile => profile.id !== id));
    };

    // Edit profile name
    const handleEdit = (id, newName) => {
        setProfiles(profiles.map(profile => profile.id === id ? { ...profile, name: newName } : profile));
    };

    return (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h4" sx={{ color: '#fff', mb: 3 }}>Who’s watching?</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                {profiles.map(profile => (
                    <Box key={profile.id} sx={{ position: 'relative' }}>
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            style={{ width: 100, height: 100, borderRadius: 8, cursor: 'pointer' }}
                            onClick={() => onSelectProfile(profile)}
                        />
                        <Typography
                            contentEditable
                            onBlur={(e) => handleEdit(profile.id, e.target.innerText)}
                            sx={{ color: '#fff', mt: 1 }}
                        >
                            {profile.name}
                        </Typography>
                        <IconButton
                            sx={{ position: 'absolute', top: 0, right: 0, color: 'white', backgroundColor: 'black' }}
                            onClick={() => deleteProfile(profile.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}

                {/* Add Profile Button (Hidden if 5 profiles exist) */}
                {profiles.length < 5 && (
                    <Tooltip title="Add Profile">
                        <IconButton onClick={addProfile} sx={{ color: '#ccc' }}>
                            <AddCircleOutlineIcon sx={{ fontSize: 100 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}
