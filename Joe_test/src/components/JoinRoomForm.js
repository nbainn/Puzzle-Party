import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoomForm.css'; 
//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from 'cors';
import axios from 'axios';

function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting\
    try {
      const response = await axios.post('/search-entry', { roomCode });
      if (response.status === 200) {
        console.log('Found room:', response.data);
        navigate(`/room/${roomCode}`);
      } else if (response.status === 404){
        console.log('Room not found:', response.data);
      } else {
        console.error('Unexpected response status:', response.status); 
      }
    } catch (error) {
      console.error('Error finding room:', error);
      console.log("error")   
    }
  };

  return (
    <form onSubmit={handleSubmit} className="join-room-form">
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        minLength="6"
        maxLength="6"
        className="join-room-input"
      />
      <button type="submit" className="join-room-button">Join Room</button>
    </form>
  );
}

export default JoinRoomForm;