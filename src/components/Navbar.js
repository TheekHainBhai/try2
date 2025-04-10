import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, action: () => navigate('/') },
    { label: 'Profile', icon: <PersonIcon />, action: handleProfile },
    { label: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { label: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMobileMenuOpen}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          onClick={() => navigate('/')}
        >
          Quality Dashboard
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/incidents')}>
            Incidents
          </Button>
          <Button color="inherit" onClick={() => navigate('/fssai')}>
            FSSAI
          </Button>
          <Button color="inherit" onClick={() => navigate('/fssai-registrations')}>
            FSSAI Registrations
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/complaints')}
            sx={{ 
              background: theme.palette.secondary.main, 
              color: 'white',
              '&:hover': {
                background: theme.palette.secondary.dark,
              }
            }}
          >
            File Complaint
          </Button>
          <Button color="inherit" onClick={() => navigate('/analytics')}>
            Analytics
          </Button>
          <Button color="inherit" onClick={() => navigate('/my-fssai-registration')}>
            My FSSAI Registration
          </Button>

          {user ? (
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 35,
                  height: 35,
                }}
                src={user.avatar}
              >
                {user.username?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ py: 1, px: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.company || 'Company'}
            </Typography>
          </Box>
          <Divider />
          {menuItems.map((item) => (
            <MenuItem key={item.label} onClick={item.action}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchorEl}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.label} onClick={item.action}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
