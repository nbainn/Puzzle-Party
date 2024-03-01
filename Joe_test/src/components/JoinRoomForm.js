import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoomForm.css'; 

function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting\
    const response = "";
    getRoom = async () => {
      try {
        response = await axios.post('/search-entry', { roomCode });
      } catch (error) {
        console.error('Error finding room:', error);
        console.log("error") 
        roomNotFound(error);    
      }
    }
    if (response.status === 200 && response.data.found) {
      console.log('Found room:', response.data);
      navigate(`/room/${roomCode}`);
    } else {
      console.error('Unexpected response status:', response.status);
      roomNotFound(response.status);  
    }
  };

  const roomNotFound = (error) => {
    createPopup("Room not found. Please try again.");
  };

  return (
    <form onSubmit={handleSubmit} className="join-room-form">
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
       // onChange={(e) => setRoomCode(e.target.value)}
        minLength="6"
        maxLength="6"
        className="join-room-input"
      />
      <button type="submit" className="join-room-button">Join Room</button>
    </form>
  );
}

export default JoinRoomForm;
