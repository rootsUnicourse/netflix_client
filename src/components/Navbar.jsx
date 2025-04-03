import React, { useContext, useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
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
    const { profiles, logout, isAdmin, setProfile, currentProfile } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [adminMenuAnchorEl, setAdminMenuAnchorEl] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Set the current profile
    useEffect(() => {
        // If we have a current profile from context, use that
        if (currentProfile) {
            setSelectedProfile(currentProfile);
        } 
        // Otherwise check sessionStorage
        else {
            const storedProfile = sessionStorage.getItem('currentProfile');
            if (storedProfile) {
                const parsedProfile = JSON.parse(storedProfile);
                setSelectedProfile(parsedProfile);
                // Also update the context
                setProfile(parsedProfile);
            } else if (profiles && profiles.length > 0) {
                // If no profile is selected, use the first one
                setSelectedProfile(profiles[0]);
                setProfile(profiles[0]);
            }
        }
    }, [profiles, setProfile, currentProfile]);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        setProfile(profile);
        handleProfileMenuClose();
    };

    const handleSwitchProfiles = () => {
        handleProfileMenuClose();
        navigate('/profiles');
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        logout();
        navigate('/');
    };

    const handleAdminMenuOpen = (event) => {
        setAdminMenuAnchorEl(event.currentTarget);
    };

    const handleAdminMenuClose = () => {
        setAdminMenuAnchorEl(null);
    };

    // Check if the current path matches
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Handle mobile navigation
    const handleMobileNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
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

                {/* Hamburger Menu for Mobile */}
                <IconButton 
                    color="inherit" 
                    aria-label="menu"
                    edge="start"
                    onClick={toggleMobileMenu}
                    sx={{ 
                        display: { xs: 'flex', md: 'none' },
                        color: 'white'
                    }}
                >
                    <MenuIcon />
                </IconButton>

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
                        onClick={() => navigate('/new-and-popular')}
                        sx={{ 
                            fontWeight: isActive('/new-and-popular') ? 'bold' : 'normal', 
                            color: isActive('/new-and-popular') ? 'white' : '#e5e5e5' 
                        }}
                    >
                        New & Popular
                    </NavButton>
                    <NavButton onClick={() => document.getElementById('watchlist-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        My List
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
                    
                    
                    {/* Admin Menu */}
                    {isAdmin && isAdmin() && (
                        <>
                            <NavButton 
                                onClick={handleAdminMenuOpen}
                                sx={{ 
                                    fontWeight: location.pathname.includes('/admin') ? 'bold' : 'normal', 
                                    color: location.pathname.includes('/admin') ? 'white' : '#e5e5e5' 
                                }}
                            >
                                Admin
                            </NavButton>
                            <Menu
                                anchorEl={adminMenuAnchorEl}
                                open={Boolean(adminMenuAnchorEl)}
                                onClose={handleAdminMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'admin-menu-button',
                                }}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: '#141414',
                                        color: '#e5e5e5',
                                        minWidth: '200px',
                                        mt: 1,
                                    }
                                }}
                            >
                                <MenuItem 
                                    onClick={() => {
                                        navigate('/admin/media/insert');
                                        handleAdminMenuClose();
                                    }}
                                    sx={{ 
                                        '&:hover': { backgroundColor: '#333' } 
                                    }}
                                >
                                    Add New Media
                                </MenuItem>
                                <MenuItem 
                                    onClick={() => {
                                        navigate('/admin/logs');
                                        handleAdminMenuClose();
                                    }}
                                    sx={{ 
                                        '&:hover': { backgroundColor: '#333' } 
                                    }}
                                >
                                    System Logs
                                </MenuItem>
                            </Menu>
                        </>
                    )}
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
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={selectedProfile.avatar}
                                    alt={selectedProfile.name}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        border: '1px solid #333'
                                    }}
                                />
                            </Box>
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
                                    backgroundColor: selectedProfile && selectedProfile._id === profile._id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <Avatar
                                    src={profile.avatar}
                                    alt={profile.name}
                                    sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        mr: 2
                                    }}
                                />
                                <Typography variant="body2">
                                    {profile.name}
                                    {selectedProfile && selectedProfile._id === profile._id && 
                                        <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', opacity: 0.7 }}>
                                            (Active)
                                        </Box>
                                    }
                                </Typography>
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

            {/* Mobile Navigation Drawer */}
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={toggleMobileMenu}
                PaperProps={{
                    sx: {
                        width: '70%',
                        maxWidth: '300px',
                        backgroundColor: '#141414',
                        color: 'white'
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {selectedProfile && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={selectedProfile.avatar}
                                    alt={selectedProfile.name}
                                    sx={{ width: 36, height: 36, mr: 1 }}
                                />
                                <Typography variant="subtitle1">{selectedProfile.name}</Typography>
                            </Box>
                        )}
                    </Box>
                    
                    <Divider sx={{ backgroundColor: '#333' }} />
                    
                    <List>
                        <ListItem button onClick={() => handleMobileNavigation('/home')}>
                            <ListItemText 
                                primary="Home" 
                                primaryTypographyProps={{ 
                                    style: { 
                                        color: isActive('/home') ? 'white' : '#e5e5e5',
                                        fontWeight: isActive('/home') ? 'bold' : 'normal'
                                    } 
                                }}
                            />
                        </ListItem>
                        <ListItem button onClick={() => handleMobileNavigation('/tvshows')}>
                            <ListItemText 
                                primary="TV Shows" 
                                primaryTypographyProps={{ 
                                    style: { 
                                        color: isActive('/tvshows') ? 'white' : '#e5e5e5',
                                        fontWeight: isActive('/tvshows') ? 'bold' : 'normal'
                                    } 
                                }}
                            />
                        </ListItem>
                        <ListItem button onClick={() => handleMobileNavigation('/movies')}>
                            <ListItemText 
                                primary="Movies" 
                                primaryTypographyProps={{ 
                                    style: { 
                                        color: isActive('/movies') ? 'white' : '#e5e5e5',
                                        fontWeight: isActive('/movies') ? 'bold' : 'normal'
                                    } 
                                }}
                            />
                        </ListItem>
                        <ListItem button onClick={() => handleMobileNavigation('/new-and-popular')}>
                            <ListItemText 
                                primary="New & Popular" 
                                primaryTypographyProps={{ 
                                    style: { 
                                        color: isActive('/new-and-popular') ? 'white' : '#e5e5e5',
                                        fontWeight: isActive('/new-and-popular') ? 'bold' : 'normal'
                                    } 
                                }}
                            />
                        </ListItem>
                        <ListItem button onClick={() => { 
                            document.getElementById('watchlist-section')?.scrollIntoView({ behavior: 'smooth' });
                            setMobileMenuOpen(false);
                        }}>
                            <ListItemText primary="My List" />
                        </ListItem>
                        <ListItem button onClick={() => handleMobileNavigation('/browse')}>
                            <ListItemText 
                                primary="Browse" 
                                primaryTypographyProps={{ 
                                    style: { 
                                        color: isActive('/browse') ? 'white' : '#e5e5e5',
                                        fontWeight: isActive('/browse') ? 'bold' : 'normal'
                                    } 
                                }}
                            />
                        </ListItem>
                        
                        {isAdmin && isAdmin() && (
                            <>
                                <Divider sx={{ backgroundColor: '#333', my: 1 }} />
                                <ListItem button onClick={() => handleMobileNavigation('/admin/media/insert')}>
                                    <ListItemText primary="Add New Media" />
                                </ListItem>
                                <ListItem button onClick={() => handleMobileNavigation('/admin/logs')}>
                                    <ListItemText primary="System Logs" />
                                </ListItem>
                            </>
                        )}
                        
                        <Divider sx={{ backgroundColor: '#333', my: 1 }} />
                        <ListItem button onClick={handleSwitchProfiles}>
                            <ListItemText primary="Switch Profiles" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemText primary="Sign Out" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
};

export default Navbar; 