import React from "react";
import { useParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import ClueList from "./ClueList";
import Grid from "./Grid";
import PlayerList from "./PlayerList";
import ExitRoom from "./ExitRoom";
import RoomStatus from "./RoomStatus";
import GeneratePuzzleForm from "./generatePuzzleForm";
import DropdownComponent from "./DropdownComponent";
import "./RoomPage.css";

function RoomPage() {
  const { roomId } = useParams();

  return (
    <div className="room-page">
      <div>
        <ExitRoom />
        <RoomStatus/>
      </div>
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        <GeneratePuzzleForm />
        <DropdownComponent />
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