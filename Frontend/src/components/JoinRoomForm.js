import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinRoomForm.css";
//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { Button, TextField } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", // Use the browser's default font family
  },
});

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#EDEEFF",
  border: "1px solid #7D9CCE",
  color: "black",
  //size of button
  fontSize: "1.5rem",
  fontFamily: "inherit",
  lineHeight: 1,
  minWidth: "50px",
  width: "120px",
  padding: "15px 10px",
  marginLeft: "5px",
});

function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();
  const { ablyClient, userId, userColor, nickname, isGuest } = useAuth();
  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting\
    try {
      const response = await axios.post("/search-entry", { roomCode });
      if (response.status === 200) {
        console.log("Found room:", response.data);
        //check if they are banned
        //console.log('Found banned:', response.data.banned_players);
        //console.log('Got rooms:', response.data);
        let str = "" + userId;
        if (!response.data.banned_players) {
          navigate(`/room/${roomCode}`);
        } else if (response.data.banned_players.includes(str)) {
          //console.log(response.data.banned_players.includes(str));
          createPopup(
            "You are banned from this room. Please enter a different room."
          );
        } else {
          navigate(`/room/${roomCode}`);
        }
      } else if (response.status === 404) {
        console.log("Room not found:", response.data);
        createPopup("Room not found. Please enter an existing room.");
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error finding room:", error);
      console.log("error");
      createPopup("Room not found. Please enter an existing room.");
    }
  };

  const createPopup = (message) => {
    // Implement popup logic here
    alert(message);
  };

  return (
    <ThemeProvider theme={theme}>
      <form onSubmit={handleSubmit} className="join-room-form">
        <TextField
          style={{
            width: "175px",
          }}
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          minLength="6"
          maxLength="6"
          className="join-room-input"
          variant="outlined"
        />
        <StyledButton type="submit" className="join-room-button">
          Join Room
        </StyledButton>
      </form>
    </ThemeProvider>
  );
}

export default JoinRoomForm;
