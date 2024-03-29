import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import ClueList from "./ClueList";
import Grid from "./Grid";
import PlayerList from "./PlayerList";
import ExitRoom from "./ExitRoom";
import RoomStatus from "./RoomStatus";
import GeneratePuzzleForm from "./GeneratePuzzleForm";
import Cheating from "./Cheating";
import CrosswordGrid from "./Crossword";
import RoomSettings from "./RoomSettings";
import { useAuth } from "../hooks/useAuth";
import "./RoomPage.css";

function RoomPage() {
  const { roomId } = useParams();
  const { ablyClient, userId, userColor, nickname } = useAuth();
  const [ablyReady, setAblyReady] = useState(false);
  // State to store the puzzle object
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    if (ablyClient) {
      // Log the current connection state
      console.log(
        "Current Ably connection state:",
        ablyClient.connection.state
      );

      // Set up a listener for when the connection state changes
      const onConnectionStateChange = (stateChange) => {
        console.log("Ably connection state has changed:", stateChange.current);

        // If Ably is connected, update state accordingly
        if (stateChange.current === "connected") {
          console.log("Ably is now connected.");
          setAblyReady(true);
        } else {
          console.log(
            "Ably is not connected. Current state:",
            stateChange.current
          );
          setAblyReady(false);
        }
      };

      ablyClient.connection.on("connectionstate", onConnectionStateChange);

      // Immediately invoke the callback if already connected
      if (ablyClient.connection.state === "connected") {
        setAblyReady(true);
      }

      // Clean up listener when the component is unmounted
      return () =>
        ablyClient.connection.off("connectionstate", onConnectionStateChange);
    }
  }, [ablyClient]);

  // Use the 'ablyReady' state to control your loading screen
  if (!ablyReady) {
    return <div>Loading...</div>;
  }

  function setPuzzleHelper(puzzle) {
    setPuzzle(puzzle);
    console.log("Puzzle set to:", puzzle);
  }

  return (
    <div className="room-page">
      <div>
        <ExitRoom />
        <RoomStatus roomId={roomId} />
      </div>
      <div className="settings">
        <RoomSettings />
      </div>
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        <GeneratePuzzleForm setPuzzle={setPuzzleHelper} />
        <Cheating />
      </div>
      <div className="game-container">
        <PlayerList />
        <CrosswordGrid puzzle={puzzle} />
        <div className="hints-chat-container">
          <ClueList />
          <ChatBox
            ablyClient={ablyClient}
            roomId={roomId}
            userId={userId}
            userColor={userColor}
            nickname={nickname}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
