import React, { useState, useEffect } from "react";
import { useParams , useNavigate} from "react-router-dom";
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
  const navigate = useNavigate();
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
  //const [playerList, setPlayerList] = useState([]);

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

useEffect(() => {
  const fetchMembers = async () => {
    if (ablyClient) {
      const channel = ablyClient.channels.get(`room:${roomId}`);
      try {
        await channel.presence.subscribe('enter', (member) => {
          //console.log(member.clientId);
          //alert('Member ' + member.clientId + ' entered ' + nickname);
          console.log(member.clientId, "entered the room");
          if (!players.includes(member.clientId)) {
            setPlayers((prevPlayers) => [...prevPlayers, member.clientId]);
          }
          //if query database for clientID if it is an integer and fetch its nickname, otherwise just print clinetID (cuz it is guest)
        });
        await channel.presence.enter();

        // Subscribe to presence events for members leaving the room
        await channel.presence.subscribe('leave', (member) => {
          console.log(member.clientId, "left the room");
          if (players.includes(member.clientId)) {
            setPlayers((prevPlayers) => prevPlayers.filter(player => player !== member.clientId));
          }
        });

        const members = await channel.presence.get();
        const existingMembers = members.map(member => member.clientId);
        
        // Update player list with existing members
        setPlayers(existingMembers);
      } catch (error) {
        console.error("Error getting current members:", error);
        // You might want to handle the error more gracefully here
      }
    } else {
      console.log("Ably client not initialized.");
    }
  };

  fetchMembers();

  // Return a cleanup function if needed
  return () => {
    // Perform cleanup actions here if necessary
  };
}, [roomId, ablyClient]); 

function kickUser(roomCode, player) {
  //need to disconnect user from room channel. 
  //implement where this automatically redirects users home on disconnect
  //navigate(`/`);
  const channel = ablyClient.channels.get(`room:${roomId}`);
  channel.presence.leave();
  //alert('Member ' + player + ' kicked from room');
  console.log("Kicked user:", player);
  setPlayers((prevPlayers) => prevPlayers.filter(p => p !== player));
}
/*useEffect(() => {
    console.log("Players updated:", players);
  }, [players]);
*/
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
      <div>
        <h2>Player List</h2>
        <ul>
          {players.map(player => (
            <div>
            <li key={player}>{player}</li>
            <button onClick={() => kickUser(roomId, player)}>Kick</button>
            </div>
          ))}
        </ul>
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
        <GeneratePuzzleForm 
          setPuzzle={setPuzzleHelper}
        />
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
          ablyClient = {ablyClient}
          roomId={roomId}
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
          <ClueList 
          puzzle = {puzzle}
          ablyClient={ablyClient}
          roomId={roomId}/>
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
