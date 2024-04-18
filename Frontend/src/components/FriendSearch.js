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
  backgroundColor: "#ffcaca",
  border: "1px solid #ca8f8f",
  color: "black",
  //size of button
  fontSize: "1.5rem",
  fontFamily: "inherit",
  lineHeight: 1.2,
  minWidth: "50px",
  width: "120px",
  padding: "15px 10px",
  marginLeft: "5px",
});

function FriendSearch() {
  const [friendName, setFriendName] = useState("");
  const navigate = useNavigate();
  const { ablyClient, userId, userColor, nickname, isGuest } = useAuth();
  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting\
    try {
      const response = await axios.post("/search-friend", { friendName });
      if (response.status === 200) {
        console.log("Found friend:", response.data);
        //check if they are a part of the list of friends you have, if so say:
        //"alreay a friend"
        //actually modify request column of database to show request
        createPopup("Friend request sent!");
      } else if (response.status === 404) {
        console.log("Friend not found:", response.data);
        createPopup("Friend not found. Please enter an existing nickname.");
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error finding room:", error);
      console.log("error");
      createPopup("Friend not found. Please enter an existing Friend.");
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
          placeholder="Enter a nickname"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
          minLength="1"
          className="join-room-input"
          variant="outlined"
        />
        <StyledButton type="submit" className="join-room-button">
          Send Friend Request
        </StyledButton>
      </form>
    </ThemeProvider>
  );
}

export default FriendSearch;
