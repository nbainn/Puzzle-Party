import React from 'react';
import { useParams } from 'react-router-dom';
import ChatBox from './ChatBox';
import ClueList from './ClueList';
import Grid from './Grid';
import PlayerList from './PlayerList';
import ExitRoom from './ExitRoom';
import './RoomPage.css'; // Importing CSS for RoomPage
//import { query } from 'express';

function RoomPage() {
  const { roomId } = useParams();
  //const location = useLocation();
  //const queryParams = new URLSearchParams(location.search);
  //const host = queryParams.get('host');
  return (
    <div className="room-page">
      <div>
        <ExitRoom/>
      </div>
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        {/* You can also display the room code here */}
      </div>
      <div className="game-container">
        <PlayerList />
        <Grid />
        <div className="hints-chat-container">
          <ClueList />
          <ChatBox />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
