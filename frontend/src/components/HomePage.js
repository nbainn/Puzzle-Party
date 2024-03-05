import React from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomForm from './JoinRoomForm';
import './HomePage.css'; 

function HomePage() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    // Generate a 6-digit room code and navigate to the RoomPage
    const roomCode = Math.random().toString().slice(2, 8);
    navigate(`/room/${roomCode}`);
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
