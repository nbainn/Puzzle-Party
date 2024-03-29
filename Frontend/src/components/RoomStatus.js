import React, { useState, useEffect } from "react";
import './RoomStatus.css'; 
import { useNavigate } from 'react-router-dom';
import  axios  from 'axios';

function RoomStatus({roomId}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('public');

  useEffect(() => {
    // Fetch the initial status of the room from the database
    const fetchRoomStatus = async () => {
      try {
        const response = await axios.post('/room-status', {roomId});
        const pub_stat= response.data.status;
        if (pub_stat === "true") {
          setStatus('public');
        } else {
          setStatus('private'); 
        }
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching room status:', error);
      }
    };

    fetchRoomStatus();
  }, [roomId]);

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