import React from 'react';
import './RoomStatus.css'; 
import { useNavigate } from 'react-router-dom';
import {useState } from "react";
import  axios  from 'axios';

function RoomStatus({roomId}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('public');

  const handleRoomStatus = async(event) => {
    event.preventDefault();
    setStatus(prevStatus => (prevStatus === 'public' ? 'private' : 'public'));
    try {// Generate a 6-digit room code and navigate to the RoomPage
        await axios.post('/change-status', { roomId: roomId, status: status });
      } catch (error) {
        console.error('Could not change status:', error)
      }
  };

  return (
    <div className="exit-room">
      <button onClick={handleRoomStatus} className="room-status-button">
      {status === 'public' ? 'Public' : 'Private'}
      </button>
    </div>
  );
}

export default RoomStatus;