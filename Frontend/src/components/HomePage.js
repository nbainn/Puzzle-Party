import React from "react";
import { useNavigate } from "react-router-dom";
import JoinRoomForm from "./JoinRoomForm";
import "./HomePage.css";
import axios from "axios";
import SuggestionBox from "./SuggestionBox";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../hooks/useAuth";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { Button } from "@mui/material";
import logo from "../assets/PuzzlePartyLogo.png";

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
  const { isGuest } = useAuth();
  //const [peer, setPeer] = useState(null);
  const { userId } = useAuth();
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

  return (
    <ThemeProvider theme={theme}>
      <div className="home-page">
        <img src={logo} alt="Puzzle Party Logo" className="logo" />
        <div className="options">
          {!isGuest && <ProfileDropdown />}
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
