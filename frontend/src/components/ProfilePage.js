import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

/**
 * ProfilePage Component
 * 
 * This component is used to display the user's profile information.
 * It fetches and shows the user's email, nickname, and color preference.
 * 
 * Accessing this page needs to be integrated into the navigation flow of the application.
 * We need to provide a link or button in HomePage.js or RoomPage.js that navigates to 
 * this page when clicked. We'd have to set up routing for it as well, linking to it 
 * whenever an icon or profile picture is clicked
 * 
 * TODO:
 * - Add a navigation button/link in HomePage.js and RoomPage.js to access the profile.
 * - Implement the functionality to update the user's nickname and userColor.
 */

function ProfilePage() {
  const { logout, userToken } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/user/profile', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [userToken]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return <LoadingScreen message="Loading user data..." />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Your Profile
      </Typography>
      {userData ? (
        <>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Name: {userData.nickname || userData.email.split('@')[0]} {/* Show nickname or derive from email */}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Email: {userData.email}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2, color: userData.userColor }}>
            Favorite Color: <Box component="span" sx={{ backgroundColor: userData.userColor, width: '15px', height: '15px', display: 'inline-block', marginLeft: '5px' }}></Box> {/* Display color box */}
          </Typography>
          {/* Add options for changing email and password at some point maybe */}
        </>
      ) : (
        <Typography>User data not found.</Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
}

export default ProfilePage;