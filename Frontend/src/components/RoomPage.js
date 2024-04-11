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
import { useAuth } from "../hooks/useAuth";
import "./RoomPage.css";

function RoomPage() {
  const { roomId } = useParams();
  const { ablyClient, userId, userColor, nickname } = useAuth();
  const [ablyReady, setAblyReady] = useState(false);
  const [puzzleData, setPuzzleData] = useState(null);

  useEffect(() => {
    let timeout;
  
    const onConnectionStateChange = (stateChange) => {
      console.log("Ably connection state has changed:", stateChange.current);
  
      // Clear timeout if it's set
      if (timeout) clearTimeout(timeout);
  
      if (stateChange.current === "connected") {
        console.log("Ably is now connected.");
        setAblyReady(true);
      } else {
        console.log("Ably is not connected. Current state:", stateChange.current);
        setAblyReady(false);
      }
    };
  
    // Check the initial state
    if (ablyClient.connection.state === "connected") {
      setAblyReady(true);
    } else {
      setAblyReady(false);
      // Setup a timeout as a fallback
      timeout = setTimeout(() => {
        console.log("Fallback: Assuming Ably is ready.");
        setAblyReady(true);
      }, 1);
    }
  
    ablyClient.connection.on("connectionstate", onConnectionStateChange);
  
    return () => {
      if (timeout) clearTimeout(timeout);
      ablyClient.connection.off("connectionstate", onConnectionStateChange);
    };
  }, [ablyClient]);

  // Store the roomId when the component mounts
  useEffect(() => {
    // Store the roomId to localStorage when the component mounts
    localStorage.setItem('currentRoomId', roomId);
  }, [roomId]);

  // Redirect to the stored roomId on component load
  useEffect(() => {
    // Retrieve the roomId from localStorage
    const savedRoomId = localStorage.getItem('currentRoomId');
    // If there's a roomId and it's not the current roomId, navigate to that room
    if (savedRoomId && savedRoomId !== roomId) {
      navigate(`/room/${savedRoomId}`);
    }
  }, []);

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

  useEffect(() => {
    const handleBeforeUnload = async function() {
        let endTime = performance.now();
        let timeSpent = (endTime - startTime);
        console.log('Time spent on page:', timeSpent, 'seconds');

        try {
            const response = await axios.post("/addTime", { userId: userId, time: timeSpent });
            if (response.status === 200) {
                console.log("time spent added!");
            } else if (response.status === 404) {
                console.log("Error", response.data);
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error contacting server", error);
            console.log("error");
        }
    };

    handleBeforeUnload();
    
    window.addEventListener('unload', handleBeforeUnload);

    return () => {
        window.removeEventListener('unload', handleBeforeUnload);
    }; 
  }, [userId, startTime]);

  function handleKick(roomCode, player) {
    console.log("Kicking player:", player);
    const channel = ablyClient.channels.get(`room:${roomCode}`);
    channel.presence.leave(player);
    setPlayers(players.filter(p => p !== player));
  }


  async function handleBan(roomCode, player) {
    console.log("Banning player:", player);
    //implement with database and rooms
    try {
      const response = await axios.post('/add-ban', { roomCode, player });
      if (response.status === 200) {
        console.log('Banned:', player);
      } else if (response.status === 404){
        console.log('Room/player not found:', response.data);
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error banning', error);
      console.log("error")
    }
  }

  /*useEffect(() => {
      console.log("Players updated:", players);
    }, [players]);
  */

  // Use the 'ablyReady' state to control your loading screen
  if (!ablyReady) {
    return <div>Loading...!</div>;
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
      <div className="room-header">
        <h2>Room: {roomId}</h2>
        <GeneratePuzzleForm />
        <Cheating />
      </div>
      <div className="game-container">
        <PlayerList />
        <CrosswordGrid />
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
