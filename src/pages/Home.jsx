import React, { useContext } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    Button, 
    Container,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import TopMatchesRow from '../components/TopMatchesRow';

// Netflix logo will be provided by the user
import NetflixLogo from '../assets/images/netflixlogo.png'; // Updated path to use existing logo

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

export default function Home() {
    const { user, profiles } = useContext(UserContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedProfile, setSelectedProfile] = React.useState(null);

    // Get the current profile from localStorage or use the first profile
    React.useEffect(() => {
        const currentProfile = localStorage.getItem('currentProfile');
        if (currentProfile) {
            setSelectedProfile(JSON.parse(currentProfile));
        } else if (profiles && profiles.length > 0) {
            setSelectedProfile(profiles[0]);
            localStorage.setItem('currentProfile', JSON.stringify(profiles[0]));
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
        localStorage.setItem('currentProfile', JSON.stringify(profile));
        handleProfileMenuClose();
    };

    const handleSwitchProfiles = () => {
        navigate('/profiles');
        handleProfileMenuClose();
    };

    return (
        <Box sx={{ 
            flexGrow: 1, 
            bgcolor: '#141414', 
            minHeight: '100vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    bgcolor: 'transparent', 
                    boxShadow: 'none',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    transition: 'background-color 0.3s',
                    '&.scrolled': {
                        backgroundColor: '#141414',
                    },
                    zIndex: 1100
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
                        <NavButton>Home</NavButton>
                        <NavButton>TV Shows</NavButton>
                        <NavButton>Movies</NavButton>
                        <NavButton>New & Popular</NavButton>
                        <NavButton>My List</NavButton>
                        <NavButton>Browse</NavButton>
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
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            
            {/* Main Content Area */}
            <Box sx={{ width: '100%' }}>
                {/* Add Toolbar to create space below the fixed AppBar */}
                <Toolbar />
                
                {/* Hero Banner */}
                <HeroBanner />
                
                {/* Content Rows */}
                <Container 
                    maxWidth={false} 
                    sx={{ 
                        mt: 4,
                        px: { xs: 1, sm: 2, md: 4 }
                    }}
                >
                    {/* Top Matches Row - AI Recommended Content */}
                    <TopMatchesRow user={user} selectedProfile={selectedProfile} />
                </Container>
            </Box>
        </Box>
    );
} 