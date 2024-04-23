import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinRoomForm from "./JoinRoomForm";
import "./HomePage.css";
import axios from "axios";
import SuggestionBox from "./SuggestionBox";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../hooks/useAuth";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { Button } from "@mui/material";
import CatLogo1 from "../assets/CatLogo1.gif";
import CatLogo2 from "../assets/CatLogo2.gif";
import Invite from './Invite';

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]",
  },
});

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#EDEEFF",
  border: "1px solid #7D9CCE",
  color: "black",
  //size of button
  fontSize: "2rem",
  fontFamily: "inherit",
  lineHeight: 2,
  minWidth: "50px",
  marginLeft: 10,
  width: "300px",
  padding: "15px 30px",
  margin: "10px",
});

//import { loadScript, createHost} from  './peer2peer.js';
function HomePage() {
  const navigate = useNavigate();
  const { isGuest, userId } = useAuth();
  //const [peer, setPeer] = useState(null);

  const handleCreateRoom = async () => {
    //console.log('supposed to get hostid')
    //const hostId = createHost();
    //console.log('hostId', hostId)

    const roomCode = Math.random().toString().slice(2, 8);
    console.log("Adding roomcode", roomCode);
    //createHost();
    //const host = createHost();
    //console.log("Adding peerID", host)
    try {
      // Generate a 6-digit room code and navigate to the RoomPage
      await axios.post("/add-entry", { roomCode });
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error("Could not create room:", error);
    }
  };

  const handleJoinList = async () => {
    navigate("/rooms/");
  };

  const handleStatistics = async () => {
    navigate(`/statistics/${userId}`);
  };

  const [showSecondGif, setShowSecondGif] = useState(false);

  const handleFirstGifLoad = () => {
    // First GIF has finished loading, switch to the second GIF
    const timeoutId = setTimeout(() => {
      setShowSecondGif(true);
    }, 8320);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="home-page">
        <Invite/>
        {!isGuest && (
          <div className="profile-dropdown">
            <ProfileDropdown />
          </div>
        )}
        {showSecondGif ? (
          <img src={CatLogo2} alt="Second GIF" className="home-image" />
        ) : (
          <img
            src={CatLogo1}
            alt="First GIF"
            className="home-image"
            onLoad={handleFirstGifLoad}
          />
        )}
        <div className="options">
          <StyledButton
            onClick={handleCreateRoom}
            className="create-room-button"
          >
            Create Room
          </StyledButton>
          <StyledButton onClick={handleJoinList} className="create-room-button">
            Join Public Room
          </StyledButton>
          <JoinRoomForm className="join-room-form" />
          <StyledButton
            onClick={handleStatistics}
            className="create-room-button"
          >
            See Statistics
          </StyledButton>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default HomePage;