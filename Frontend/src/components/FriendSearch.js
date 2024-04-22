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
  // Background color of button
  backgroundColor: "#ffcaca",
  border: "1px solid #ca8f8f",
  color: "black",
  // Size of button
  fontSize: "1rem", // Set font size smaller
  fontFamily: "inherit",
  lineHeight: 1.5,
  width: "175px", // Set width to match the TextField
  padding: "15px 10px",
  marginLeft: "5px",
});

function FriendSearch( object) {
  //friends.friends
  //friends.pending
  //friends.requested
  const [friendName, setFriendName] = useState("");
  const navigate = useNavigate();
  const { ablyClient, userId, userColor, nickname, isGuest } = useAuth();
  const handleSubmit = async (event) => {
    event.preventDefault();
    //console.log(friends, "friends and pend ", pending, "and requested: " , requested);
    if (object.friends.includes(friendName)) {
        createPopup("Already a friend!");
    } else if (object.pending.includes(friendName)) {
        createPopup("Friend request already sent!");
    } else if (object.requested.includes(friendName)) {
      createPopup("Accept friend request!");
    } else {
        try {
            const response = await axios.post("/search-friend", { friendName, userId });
        if (response.status === 200) {
            console.log("Found friend:", response.data);
            //actually modify request column of database to show request
            //maybe create a pending acceptance column? consider declining? maybe save for last
            //add pk to my pending column and to their reqests column
            createPopup("Friend request sent!");
            //send pending and request list to profile page, for each change have a use state and render.
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
            //padding: "15px 10px", // Match padding of the button
            lineHeight: 1.2, // Match lineHeight of the button
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
