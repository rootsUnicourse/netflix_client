import React, { useContext, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import UserContext from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NetflixLogo from '../assets/images/netflixlogo.png';

const NavButton = styled(Button)(({ theme }) => ({
    color: '#e5e5e5',
    marginRight: theme.spacing(2),
    '&:hover': {
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: 'normal',
    padding: '4px 8px',
}));

const Navbar = ({ transparent = false }) => {
    const { user, profiles, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);

    // Set the current profile
    React.useEffect(() => {
        const currentProfile = sessionStorage.getItem('currentProfile');
        if (currentProfile) {
            setSelectedProfile(JSON.parse(currentProfile));
        } else if (profiles && profiles.length > 0) {
            setSelectedProfile(profiles[0]);
            sessionStorage.setItem('currentProfile', JSON.stringify(profiles[0]));
        }
    }, [profiles]);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        sessionStorage.setItem('currentProfile', JSON.stringify(profile));
        handleProfileMenuClose();
    };

    const handleSwitchProfiles = () => {
        navigate('/profiles');
        handleProfileMenuClose();
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        logout();
        navigate('/');
    };

    // Check if the current path matches
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                bgcolor: transparent ? 'transparent' : 'rgba(20, 20, 20, 0.8)',
                boxShadow: 'none',
                background: transparent 
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' 
                    : 'rgba(20, 20, 20, 0.8)',
                backdropFilter: transparent ? 'none' : 'blur(8px)',
                transition: 'background-color 0.3s',
                '&.scrolled': {
                    backgroundColor: '#141414',
                },
            }}
        >
            <Toolbar sx={{ padding: { xs: '0 16px', sm: '0 40px' } }}>
                {/* Netflix Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 0, md: 0 }, mr: { xs: 2, md: 4 } }}>
                    <img
                        src={NetflixLogo}
                        alt="Netflix"
                        style={{ height: '32px', cursor: 'pointer' }}
                        onClick={() => navigate('/home')}
                    />
                </Box>

                {/* Navigation Links - Desktop */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                    <NavButton 
                        onClick={() => navigate('/home')}
                        sx={{ 
                            fontWeight: isActive('/home') ? 'bold' : 'normal', 
                            color: isActive('/home') ? 'white' : '#e5e5e5' 
                        }}
                    >
                        Home
                    </NavButton>
                    <NavButton 
                        onClick={() => navigate('/tvshows')}
                        sx={{ 
                            fontWeight: isActive('/tvshows') ? 'bold' : 'normal', 
                            color: isActive('/tvshows') ? 'white' : '#e5e5e5' 
                        }}
                    >
                        TV Shows
                    </NavButton>
                    <NavButton 
                        onClick={() => navigate('/movies')}
                        sx={{ 
                            fontWeight: isActive('/movies') ? 'bold' : 'normal', 
                            color: isActive('/movies') ? 'white' : '#e5e5e5' 
                        }}
                    >
                        Movies
                    </NavButton>
                    <NavButton 
                        onClick={() => navigate('/browse')}
                        sx={{ 
                            fontWeight: isActive('/browse') ? 'bold' : 'normal', 
                            color: isActive('/browse') ? 'white' : '#e5e5e5' 
                        }}
                    >
                        Browse
                    </NavButton>
                    <NavButton>New & Popular</NavButton>
                    <NavButton onClick={() => document.getElementById('watchlist-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        My List
                    </NavButton>
                </Box>

                {/* Navigation Links - Mobile (Dropdown) */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
                    <NavButton>Browse</NavButton>
                </Box>

                {/* Right side - Search and Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                    <IconButton color="inherit" sx={{ color: 'white' }}>
                        <SearchIcon />
                    </IconButton>

                    {/* Profile Avatar */}
                    {selectedProfile && (
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            sx={{ ml: 2 }}
                        >
                            <Avatar
                                src={selectedProfile.avatar}
                                alt={selectedProfile.name}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    border: '1px solid #333'
                                }}
                            />
                        </IconButton>
                    )}

                    {/* Profile Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        PaperProps={{
                            sx: {
                                bgcolor: 'rgba(0,0,0,0.9)',
                                color: 'white',
                                border: '1px solid #333',
                                minWidth: '200px',
                                mt: 1,
                                '& .MuiList-root': {
                                    padding: '8px 0',
                                }
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {profiles && profiles.map(profile => (
                            <MenuItem
                                key={profile._id}
                                onClick={() => handleProfileSelect(profile)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px 16px',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <Avatar
                                    src={profile.avatar}
                                    alt={profile.name}
                                    sx={{ width: 32, height: 32, mr: 2 }}
                                />
                                <Typography variant="body2">{profile.name}</Typography>
                            </MenuItem>
                        ))}
                        <MenuItem
                            onClick={handleSwitchProfiles}
                            sx={{
                                borderTop: '1px solid #333',
                                mt: 1,
                                pt: 1,
                                padding: '8px 16px',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <Typography variant="body2">Switch Profiles</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                borderTop: '1px solid #333',
                                mt: 1,
                                pt: 1,
                                padding: '8px 16px',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <Typography variant="body2">Sign Out</Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 