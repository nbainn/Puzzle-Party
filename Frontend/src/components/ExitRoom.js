import React from 'react';
import './ExitRoom.css'; 
import { useNavigate } from 'react-router-dom';
import { styled, createTheme, ThemeProvider  } from "@mui/material/styles";
import { Button, ButtonGroup } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", // Use the browser's default font family
  },
});

const StyledButton = styled(Button)({
  fontSize: "1rem",
  fontFamily: "inherit",
});


function ExitRoom({roomId, ablyClient}) {
  const navigate = useNavigate();

  const handleExitRoom = async (event) => {
    const channel = ablyClient.channels.get(`room:${roomId}`);
    event.preventDefault();
    //channel.unsubscribe('myEvent', myListener);
    /* remove the listener registered for all events */
    //channel.unsubscribe(myListener);
    await channel.detach();
    navigate(`/home`);
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledButton variant = "text" onClick={handleExitRoom} className="exit-room-button">
        Exit Room
      </StyledButton>
      </ThemeProvider>
  );
}

export default ExitRoom;