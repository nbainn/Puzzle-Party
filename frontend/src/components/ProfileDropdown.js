import { useEffect, useState } from 'react';
import { Avatar, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileDropdown() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { userToken, logout, setUserColor, setNickname } = useAuth();
  const [nickname, setLocalNickname] = useState('');
  const [userColor, setUserColorLocal] = useState('');
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/user/profile', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        if (response.data) {
          setLocalNickname(response.data.nickname);
          setUserColorLocal(response.data.userColor);
          setNickname(response.data.nickname);
          setUserColor(response.data.userColor);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, [userToken, setNickname, setUserColor]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/profile');
    handleClose();
  };

  const initial = nickname ? nickname[0].toUpperCase() : '';

  // Function to calculate contrasting color
  const getContrastColor = (bgColor) => {
    if (!bgColor) return '#FFFFFF';
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const uicolors = [r / 255, g / 255, b / 255];
    const c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L > 0.179 ? '#000000' : '#FFFFFF';
  };

  // Set text color based on background color
  const textColor = getContrastColor(userColor);

  return (
    <div>
      <Avatar 
        sx={{ 
          bgcolor: userColor, 
          color: textColor, 
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }} 
        onClick={handleClick}>
        {initial}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Settings</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Logout</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}

export default ProfileDropdown;