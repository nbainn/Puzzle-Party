import React, { useState, useEffect } from "react";
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

function Invite() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();
  const { ablyClient, userId, userColor, nickname, isGuest } = useAuth();
  
  const handleInviting = () => {
    // Implement popup logic here
    //createPopup("Inviting friends to join the room");
  };

  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to ChatBox", ablyClient);

      const onConnected = () => {
        console.log(
          "Ably client connected, now subscribing to channel:",
          `invite`
        );
        const channel = ablyClient.channels.get(`invite_channel`);
        const onInvite = (message) => {
          let str = "" + userId;
          if (message.data.text === str) {
            if (message.data.state === "invite") {
              console.log("Invited to this room:", message.data);
            }
          }
        };
        channel.subscribe("invite", onInvite);

        return () => {
          channel.unsubscribe("invite", onInvite);
          ablyClient.connection.off("connected", onConnected);
        };
      };
      if (ablyClient.connection.state === "connected") {
        onConnected();
      } else {
        ablyClient.connection.once("connected", onConnected);
      }
    }
}, [ablyClient]);

  const createPopup = (message) => {
    // Implement popup logic here
    alert(message);
  };

  return (
    <div>i</div>
  );
}

export default Invite;