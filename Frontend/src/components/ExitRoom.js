import React from 'react';
import './ExitRoom.css'; 
import { useNavigate } from 'react-router-dom';

function ExitRoom() {
  const navigate = useNavigate();

  const handleExitRoom = (event) => {
    event.preventDefault();
    navigate(`/home`);
  };

  return (
    <div className="exit-room">
      <button onClick={handleExitRoom} className="exit-room-button">
        Exit Room
      </button>
    </div>
  );
}

export default ExitRoom;