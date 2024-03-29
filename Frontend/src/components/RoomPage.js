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
  const [players, setPlayers] = useState([]);
  const [timer, setTimer] = useState(true);
  const [hints, setHints] = useState(true);
  const [guesses, setGuesses] = useState(true);
  const [revealGrid, setRevealGrid] = useState(false);
  const [revealHint, setRevealHint] = useState(false);
  const [checkWord, setCheckWord] = useState(false);
  const [checkGrid, setCheckGrid] = useState(false);

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
/*
  useEffect(() => {
    if (ablyClient) {
      console.log("Ably client provided to RoomPage", ablyClient);

      // Function to handle presence messages
      const onPresence = (presenceMsg) => {
        if (presenceMsg.action === "enter") {
          const newPlayerNickname = presenceMsg.clientId; // Use clientId as nickname
          setPlayers((prevPlayers) => {
            if (!prevPlayers.includes(newPlayerNickname)) {
              return [...prevPlayers, newPlayerNickname];
            }
            return prevPlayers;
          });
          
        } else if (presenceMsg.action === "leave") {
          const leftPlayerNickname = presenceMsg.clientId;
          setPlayers((prevPlayers) =>
            prevPlayers.filter((player) => player !== leftPlayerNickname)
          );
        }
      };

      // Subscribe to presence events
      const channel = ablyClient.channels.get(`room:${roomId}`);
      channel.presence.subscribe(onPresence);

      // Fetch current presence information
      channel.presence.get((err, members) => {
        if (!err) {
          const currentPlayers = members.map((member) => member.clientId);
          setPlayers(currentPlayers);
        }
      });

      return () => {
        channel.presence.unsubscribe(onPresence);
      };
    }
  }, [ablyClient, roomId]);
*/
  useEffect(() => {
    console.log("Players updated:", players);
  }, [players]);

  // Use the 'ablyReady' state to control your loading screen
  if (!ablyReady) {
    return <div>Loading...</div>;
  }

  function setPuzzleHelper(puzzle) {
    setPuzzle(puzzle);
    console.log("Puzzle set to:", puzzle);
  }

/*
  function PlayerList({ players }) {
    return (
      <div>
        <h3>Players in the room:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    );
  }
*/
  return (
    <div className="room-page">
      <div>
        <ExitRoom />
        <RoomStatus roomId={roomId} />
      </div>
      <div className="settings">
        <RoomSettings
          timer={timer}
          hints={hints}
          guesses={guesses}
          setTimer={setTimer}
          setHints={setHints}
          setGuesses={setGuesses}
        />
      </div>
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        <GeneratePuzzleForm setPuzzle={setPuzzleHelper} />
        <Cheating
          setRevealGrid={setRevealGrid}
          setRevealHint={setRevealHint}
          setCheckWord={setCheckWord}
          setCheckGrid={setCheckGrid}
        />
      </div>
      <div className="game-container">
        <PlayerList />
        <CrosswordGrid
          puzzle={puzzle}
          hints={hints}
          guesses={guesses}
          revealGrid={revealGrid}
          setRevealGrid={setRevealGrid}
          revealHint={revealHint}
          setRevealHint={setRevealHint}
          checkWord={checkWord}
          setCheckWord={setCheckWord}
          checkGrid={checkGrid}
          setCheckGrid={setCheckGrid}
        />
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
