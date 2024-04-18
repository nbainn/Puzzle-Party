import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import axios from "axios";
import LoadingScreen from './LoadingScreen';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ProfilePage() {
  const { logout, userId, userToken, userColor, nickname, updateAuthContext } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ nickname, userColor });
  const [friends, setFriends] = useState([]);
  const [realPlayers, setRealPlayers] = useState([]);
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
      try {
        console.log(userId);
        const response = await axios.post('/user-friends', { userId });
        if (response.status === 200) {
          if (response.data.friends) {
            setFriends(response.data.friends);
          }
        //setLocalNickname(response.data.nickname);
        //setLocalUserColor(response.data.userColor);
        } else {
          console.log("Error fetching friends data:", response);
        }
      } catch (error) {
        console.error('Error fetching friend data:', error);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [userToken]);

  useEffect(() => {
    if (friends) {
      console.log(friends);
    }
  }, [friends]);

  useEffect(() => {
    const fetchNicknames = async () => {
      const realPlayersList = await Promise.all(friends.map(async (friend) => {
        const integerValue = parseInt(friend);
        if (!isNaN(integerValue)) {
          try {
            const response = await axios.post("/fetch-nickname", { userId: friend });
            if (response.status === 200) {
              console.log("Nickname for user", friend, "is", response.data);
              return response.data;
            }
          } catch (error) {
            console.error("Error fetching nickname for user:", error);
          }
        }
        return friend;
      }));
      setRealPlayers(realPlayersList);
    };

    fetchNicknames();
  }, [friends]);

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
    <>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Nickname:
        <input type="text" value={localNickname} onChange={handleNicknameChange} />
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Favorite Color:
        <HexColorPicker color={localUserColor} onChange={setLocalUserColor} />
      </Typography>
      <Button variant="contained" color="primary" onClick={handleSaveClick}>
        Save Changes
      </Button>
    </>
  );

  const renderDefaultView = () => (
    <>
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
      <Button variant="contained" color="primary" onClick={handleEditClick}>
        Edit Profile
      </Button>
    </>
  );

  return (
    <div>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBackHome} sx={{ alignSelf: 'flex-start' }}>
        BACK TO HOME
      </Button>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Your Profile
      </Typography>
      {editing ? renderEditView() : renderDefaultView()}
      <Button variant="contained" color="secondary" onClick={handleLogoutClick} sx={{ marginTop: 2 }}>
        Logout
      </Button>
    </Box>
     <h2>Friends:</h2>
     {friends.length > 0 && (
     <ul>
     {friends.map((friend, index) => (
        <div key={friend}>
        <li>
        {realPlayers[index]}
         </li>
        </div>
        ))}
     </ul>
     )}
   </div>
  );
}

export default ProfilePage;