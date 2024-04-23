import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Card, CardContent, Container, TextField } from '@mui/material';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FriendSearch from "./FriendSearch";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#DDE4FF",
  border: "1px solid #7D9CCE",
  color: "black",
  //size of button
  width: "50px",
  fontSize: "10px",
  fontFamily: "inherit",
  lineHeight: 0,
  minWidth: "50px",
  marginLeft: 10,
});

function ProfilePage() {
  const { logout, userId, userToken, userColor, nickname, updateAuthContext } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ nickname, userColor });
  const [friends, setFriends] = useState([]);
  const [realPlayers, setRealPlayers] = useState([]);
  const [friendRooms, setFriendRooms] = useState([]);
  const [requested, setRequested] = useState([]);
  const [realRequested, setRealRequested] = useState([]);
  const [pending, setPending] = useState([]);
  const [realPending, setRealPending] = useState([]);
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
        updateAuthContext(response.data.nickname, response.data.userColor);
        if (response.data.friends) {
          setFriends(response.data.friends); 
        }// Update requested list
        if (response.data.requests) {
        setRequested(response.data.requests); // Update requested list
        }
        if (response.data.pending) {
        setPending(response.data.pending); // Update pending list
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [userToken, updateAuthContext]);

  useEffect(() => {
    if (friendRooms) {
      //console.log(friends);
    }
  }, [friendRooms]);

  useEffect(() => {
    const fetchNicknames = async () => {
      const realPlayersList = await Promise.all(friends.map(async (friend) => {
        const integerValue = parseInt(friend);
        if (!isNaN(integerValue)) {
          try {
            const response = await axios.post("/fetch-nickname", { userId: friend });
            if (response.status === 200) {
              return response.data;
            }
          } catch (error) {
            console.error("Error fetching nickname for user:", error);
          }
        }
        return friend;
      }));
      const room_list = await Promise.all(friends.map(async (friend) => {
        const integerValue = parseInt(friend);
        if (!isNaN(integerValue)) {
          try {
            const response = await axios.post("/fetch-friend-room", { userId: friend });
            if (response.status === 200) {
              let str = "" + userId;
              if (!response.data.banned_players) {
                return response.data.room_code;
              } else if (response.data.banned_players.includes(str)) {
                //console.log(response.data.banned_players.includes(str));
                //createPopup(
                //  "You are banned from this room. Please enter a different room."
                //);
                return "You have been banned from this friends room";
              } else {
                //navigate(`/room/${roomCode}`);
                return response.data.room_code;
              }
            } else {
              return null;
            }
          } catch (error) {
            console.error("Error fetching nickname for user:", error);
          }
        }
        return null;
      }));
      setFriendRooms(room_list);
      setRealPlayers(realPlayersList);
    };

    fetchNicknames();
  }, [friends]);

  useEffect(() => {
    const fetchPending = async () => {
      const realPlayersList = await Promise.all(pending.map(async (pend) => {
        const integerValue = parseInt(pend);
        if (!isNaN(integerValue)) {
          try {
            const response = await axios.post("/fetch-nickname", { userId: pend });
            if (response.status === 200) {
              //console.log("Nickname for user", friend, "is", response.data);
              return response.data;
            }
          } catch (error) {
            console.error("Error fetching nickname for user:", error);
          }
        }
        return pend;
      }));
      setRealPending(realPlayersList);
    };

    fetchPending();
  }, [pending]);


  useEffect(() => {
    const fetchRequests = async () => {
      const realPlayersList = await Promise.all(requested.map(async (request) => {
        const integerValue = parseInt(request);
        if (!isNaN(integerValue)) {
          try {
            const response = await axios.post("/fetch-nickname", { userId: request });
            if (response.status === 200) {
              //console.log("Nickname for user", friend, "is", response.data);
              return response.data;
            }
          } catch (error) {
            console.error("Error fetching nickname for user:", error);
          }
        }
        return request;
      }));
      setRealRequested(realPlayersList);
    };

    fetchRequests();
  }, [requested]);

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

  const renderJoinButton = (roomNumber) => {
    if (roomNumber === "You have been banned from this friends room") {
      createPopup("You have been banned from this friends room");
    } else {
      navigate(`/room/${roomNumber}`);
    }
  };

  

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleAccept = async (request) => {
    try {
      const response = await axios.post("/accept-friend", { userId: userId, friendId: request});
      if (response.status === 200) {
        //console.log("Nickname for user", friend, "is", response.data);
        createPopup("You are now friends! Please refresh the page to see changes.");
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching nickname for user:", error);
    }
    //console.log(request);
  };
  const createPopup = (message) => {
    // Implement popup logic here
    alert(message);
  };

  const handleDecline = async (request) => {
    console.log(request);
    try {
      const response = await axios.post("/delete-friend", { userId: userId, friendId: request});
      if (response.status === 200) {
        //console.log("Nickname for user", friend, "is", response.data);
        createPopup("You have declined the request! Please refresh the page to see changes.");
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching nickname for user:", error);
    }
  };

  const renderEditView = () => (
    
    <Card>
      <CardContent sx={{ textAlign: 'center', backgroundColor: '#FFE6FD',  width: "300px", paddingTop: "15px", paddingBottom: "15px" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            font: "inherit",
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'black',
            backgroundColor: '#FFE6FD',
            '&:hover': {
              backgroundColor: 'grey.200',
            },
          }}
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
          sx={{
            font: "inherit",
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'black',
            backgroundColor: '#DDE4FF',
            '&:hover': {
              backgroundColor: 'grey.200',
            },
          }}
        >
          Home
        </Button>
      </CardContent>
    </Card>
  );

  const renderDefaultView = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center', backgroundColor: '#FFE6FD', width: "300px", paddingTop: "15px", paddingBottom: "15px" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            font: "inherit",
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'black',
            backgroundColor: '#DDE4FF',
            '&:hover': {
              backgroundColor: 'grey.200',
            },
          }}
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
          <Box
            component="span"
            sx={{
              backgroundColor: userColor,
              width: '15px',
              height: '15px',
              display: 'inline-block',
              marginLeft: '5px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 0 0 1px white',
            }}
          />
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleEditClick} sx={{ marginBottom: 2, font: "inherit" }}>
            Edit Profile
          </Button>
          <Button variant="contained" color="secondary" onClick={handleLogoutClick} sx={{ font: "inherit" }}>
            Logout
          </Button>
        </Box>
        <Button
          startIcon={<HomeIcon />}
          onClick={handleBackHome}
          sx={{
            font: "inherit",
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'black',
            backgroundColor: '#DDE4FF',
            '&:hover': {
              backgroundColor: 'grey.200',
            },
          }}
        >
          Home
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div style = {{ backgroundColor: "#29284D"}}>
     <Container
      component="main"
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#29284D",
        padding: 0,
        margin: 0,
      }}
     >
       <div style={{ display: 'flex', flexDirection: 'row' }}>
      {editing ? renderEditView() : renderDefaultView()}
      <div style={{ width: '40px' }} /> 
      <CardContent sx={{ paddingTop: "40px", textAlign: 'center', borderRadius: "4px", boxShadow: "0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)", backgroundColor: '#FFE6FD', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={{ marginRight: '40px' , marginLeft: '40px'}}>  
      <h2>Friends:</h2>
     {friends.length > 0 ? (
     <ul>
     {friends.map((friend, index) => (
        <div key={friend}>
        <li>
        {realPlayers[index]}
        {friendRooms[index] && (
        <StyledButton
          onClick={(event) => renderJoinButton (friendRooms[index])}
                    >
           Join     
          </StyledButton>
         )}
         </li>
        </div>
        ))}
     </ul>
     ) : (
      <p>No friends</p>
     )}
     
    </div>
    <div style={{ marginRight: '40px'}}>
     {/* Existing profile rendering code */}
    <h2>Pending Requests:</h2>
    {pending.length > 0 ? (
      <ul>
        {pending.map((pending, index) => (
          <li key={index}>{realPending[index]}</li>
          ))}
      </ul>
    ) : (
      <p>No pending requests</p>
    )}
    </div>
    <div style={{ marginRight: '40px' }}>
    <h2>Friend Requests:</h2>
    {requested.length > 0 ? (
      <ul>
        {requested.map((request, index) => (
          <li key={index}>{realRequested[index]}
          <StyledButton
          onClick={(event) => handleAccept(request)}
                    >
           Accept          
          </StyledButton>
          <StyledButton
          onClick={(event) => handleDecline(request)}
                    >
           Delete         
          </StyledButton>
          </li>
        ))}
      </ul>
    ) : (
      <p>No friend requests</p>
    )}
    </div>
    </div>
     <FriendSearch
      friends={realPlayers}
      pending={realPending}
      requested={realRequested}
    />
    </CardContent>
    </div>
    </Container>
   </div>
  );
}

export default ProfilePage;