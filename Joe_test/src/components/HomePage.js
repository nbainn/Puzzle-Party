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

  return (
    <div className="home-page">
      <h1 className="home-title">Welcome to Puzzle Party</h1>
      <button onClick={handleCreateRoom} className="create-room-button">
        Create Room
      </button>
      <JoinRoomForm />
      <label for="favcolor">Select your Cursor Color:</label>
      <input type="color" id="favcolor1" name="favcolor" 
       value="#F88379" onChange="sendColor(document.getElementById('favcolor1').value)">
      </input>
    </div>
  );
}

export default HomePage;
