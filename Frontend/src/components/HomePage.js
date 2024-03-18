import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomForm from './JoinRoomForm';
import './HomePage.css'; 
import axios from 'axios';
//import { loadScript, createHost} from  './peer2peer.js';
import Ably from 'ably';

function HomePage() {
  const navigate = useNavigate();
  //const [peer, setPeer] = useState(null);
  
  useEffect(() => {
    const ably = new Ably.Realtime.Promise({
      authUrl: '/getAblyToken',
      authMethod: 'POST', // Ensure we use POST
      authHeaders: {
        'Content-Type': 'application/json', // Set appropriate headers
      },
      authParams: {
        clientId: 'temporary-client-id', // Send client ID (need to implement)
      },
    });
    window.ably = ably; // Make Ably instance available globally
  }, []);

  const handleCreateRoom = async () => {
    //console.log('supposed to get hostid')
    //const hostId = createHost();
    //console.log('hostId', hostId)

    const roomCode = Math.random().toString().slice(2, 8);
    console.log( "Adding roomcode", roomCode  );
    //createHost();
    //const host = createHost();
    //console.log("Adding peerID", host)
    try {// Generate a 6-digit room code and navigate to the RoomPage
      await axios.post('/add-entry', { roomCode });
      const ably = window.ably;
      const channel = ably.channels.get('rooms');
      channel.presence.enterClient('host', { roomId: roomCode });
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error('Could not create room:', error)
    }
  };

  const handleJoinList= async () => {
    navigate('/rooms/');
  };

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to Puzzle Party</h1>
      <button onClick={handleCreateRoom} className="create-room-button">
        Create Room
      </button>
      <button  onClick = {handleJoinList}className="create-room-button">
        Join Public Room
      </button>
      <JoinRoomForm />
    </div>
  );
}

export default HomePage;
