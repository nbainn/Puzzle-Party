import React from "react";
import { useNavigate } from "react-router-dom";
import JoinRoomForm from "./JoinRoomForm";
import SuggestionBox from "./SuggestionBox";
import "./HomePage.css";
import axios from "axios";
//import { loadScript, createHost} from  './peer2peer.js';

function HomePage() {
  const navigate = useNavigate();
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

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to Puzzle Party</h1>
      <button onClick={handleCreateRoom} className="create-room-button">
        Create Room
      </button>
      <button onClick={handleJoinList} className="create-room-button">
        Join Public Room
      </button>
      <JoinRoomForm />
      <SuggestionBox />
    </div>
  );
}

export default HomePage;
