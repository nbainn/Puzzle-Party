import React from 'react';
import './RoomStatus.css'; 
import { useNavigate } from 'react-router-dom';
import {useState } from "react";
function RoomStatus() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('public');

  const handleExitRoom = (event) => {
    event.preventDefault();
    setStatus(prevStatus => (prevStatus === 'public' ? 'private' : 'public'));
  };

  return (
    <div className="exit-room">
      <button onClick={handleExitRoom} className="room-status-button">
      {status === 'public' ? 'Public' : 'Private'}
      </button>
    </div>
  );
}

export default RoomStatus;