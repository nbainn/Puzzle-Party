import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoomForm.css'; 

function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting
    navigate(`/room/${roomCode}`);
  };

  return (
    <form onSubmit={handleSubmit} className="join-room-form">
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        maxLength="6"
        className="join-room-input"
      />
      <button type="submit" className="join-room-button">Join Room</button>
    </form>
  );
}

export default JoinRoomForm;
