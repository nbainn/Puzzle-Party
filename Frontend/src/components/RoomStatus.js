import React, { useState, useEffect } from "react";
import './RoomStatus.css'; 
import { useNavigate } from 'react-router-dom';
import { styled, createTheme, ThemeProvider  } from "@mui/material/styles";
import { Button, ButtonGroup } from "@mui/material";
import  axios  from 'axios';

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", // Use the browser's default font family
  },
});

const StyledButton = styled(Button)({
  fontSize: "1rem",
  fontFamily: "inherit",
});

function RoomStatus({roomId}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch the initial status of the room from the database
    const fetchRoomStatus = async () => {
      try {
        const response = await axios.post('/room-status', {roomId});
        //console.log('response.data', response.data);
        const pub_stat= response.data;
        console.log('pub_stat', pub_stat);
        setStatus(pub_stat === true ? 'public' : 'private');
      } catch (error) {
        console.error('Error fetching room status:', error);
        setStatus('public');
      }
    };

    fetchRoomStatus();
  }, [roomId]);

  const handleRoomStatus = async(event) => {
    event.preventDefault();
    setStatus(prevStatus => (prevStatus === 'public' ? 'private' : 'public'));
    try {// Generate a 6-digit room code and navigate to the RoomPage
        await axios.post('/change-status', { roomId: roomId, status: status });
      } catch (error) {
        console.error('Could not change status:', error)
      }
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledButton variant = "text" onClick={handleRoomStatus} className="room-status-button">
      {status === 'public' ? 'Public' : 'Private'}
      </StyledButton>
    </ThemeProvider>
  );
}

export default RoomStatus;