import React from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomForm from './JoinRoomForm';
import './HomePage.css'; 

function HomePage() {
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {// Generate a 6-digit room code and navigate to the RoomPage
      const roomCode = Math.random().toString().slice(2, 8);
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
    </div>
  );
}

export default HomePage;
