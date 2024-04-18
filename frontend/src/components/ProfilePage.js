import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Card, CardContent, Container, TextField } from '@mui/material';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ProfilePage() {
  const { logout, userToken, userColor, nickname, updateAuthContext } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ nickname, userColor });
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localNickname, setLocalNickname] = useState(nickname);
  const [localUserColor, setLocalUserColor] = useState(userColor);

  useEffect(() => {
    setIsLoading(true);
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/user/profile', {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setUserData(response.data);
        setLocalNickname(response.data.nickname);
        setLocalUserColor(response.data.userColor);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [userToken]);

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveClick = async () => {
    setIsLoading(true);
    setEditing(false);
    setUnsavedChanges(false);
  
    try {
      const response = await axios.post('/updateProfile', {
        nickname: localNickname,
        userColor: localUserColor
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
  
      if (response.status === 200) {
        setUserData({
          ...userData,
          nickname: localNickname,
          userColor: localUserColor
        });
        updateAuthContext(localNickname, localUserColor);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
    setIsLoading(false);
  };

  const handleNicknameChange = (event) => {
    setUnsavedChanges(true);
    setLocalNickname(event.target.value);
  };

  const handleBackHome = () => {
    if (unsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Do you want to leave without saving?");
      if (confirmLeave) {
        navigate('/home');
      }
    } else {
      navigate('/home');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const renderEditView = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ position: 'absolute', top: 16, left: 16 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontSize: '2rem', marginBottom: 2 }}>
          Your Profile
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          Nickname:
        </Typography>
        <TextField
          fullWidth
          value={localNickname}
          onChange={handleNicknameChange}
          margin="normal"
          variant="outlined"
          sx={{ fontSize: '1.5rem' }}
        />
        <Typography variant="body1" sx={{ marginTop: 1, marginBottom: 1 }}>
          Favorite Color:
        </Typography>
        <Box sx={{ marginY: 2 }}>
          <HexColorPicker color={localUserColor} onChange={setLocalUserColor} />
        </Box>
        <Button variant="contained" color="primary" onClick={handleSaveClick}>
          Save Changes
        </Button>
        <Button
          startIcon={<HomeIcon />}
          onClick={handleBackHome}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          Home
        </Button>
      </CardContent>
    </Card>
  );

  const renderDefaultView = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ position: 'absolute', top: 16, left: 16 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontSize: '2rem', marginBottom: 2 }}>
          Your Profile
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Nickname: {nickname}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Email: {userData.email}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Favorite Color:
          <Box component="span" sx={{ backgroundColor: userColor, width: '15px', height: '15px', display: 'inline-block', marginLeft: '5px' }}></Box>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleEditClick} sx={{ marginBottom: 2 }}>
            Edit Profile
          </Button>
          <Button variant="contained" color="secondary" onClick={handleLogoutClick}>
            Logout
          </Button>
        </Box>
        <Button
          startIcon={<HomeIcon />}
          onClick={handleBackHome}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          Home
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Container component="main" maxWidth="xs" sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'auto',
      textAlign: 'center'
    }}>
      {editing ? renderEditView() : renderDefaultView()}
    </Container>
  );
}

export default ProfilePage;