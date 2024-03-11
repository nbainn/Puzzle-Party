import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomForm from './JoinRoomForm';
import './HomePage.css'; 
import axios from 'axios';
import { loadScript, createHost} from  './peer2peer.js';

function HomePage() {
  const navigate = useNavigate();
  //const [peer, setPeer] = useState(null);
  
  useEffect(() => {
    loadScript(); // Call loadScript when component mounts
  }, []);

  const handleCreateRoom = async () => {
    //console.log('supposed to get hostid')
    //loadScript();
    //const hostId = createHost();
    //console.log('hostId', hostId)
    const createHost = () => {
      const peer = window.peer;
      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        // Add your logic here to handle the peer ID
      });
      peer.on('connection', function (conn) {
        conn.on('open', function () {
          // Receive messages
          conn.on('data', function (data) {
            console.log('Received', data);
          });

          // Send messages
          conn.send('Hello!');
        });
      });
    }; 

    const roomCode = Math.random().toString().slice(2, 8);
    console.log( "Adding roomcode", roomCode  );
    //createHost();
    //const host = createHost();
    //console.log("Adding peerID", host)
    try {// Generate a 6-digit room code and navigate to the RoomPage
      await axios.post('/add-entry', { roomCode });
      console.log('Added room to db');
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
