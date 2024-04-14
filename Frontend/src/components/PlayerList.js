import React, { useEffect, useState } from 'react';
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { styled, createTheme, ThemeProvider  } from "@mui/material/styles";
import { Button } from "@mui/material";
import './PlayerList.css'; 

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", // Use the browser's default font family
  },
});

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#ffcaca",
  border: "1px solid #ca8f8f",
  color: "black",
  //size of button
  width: "50px",
  fontSize: "10px",
  fontFamily: "inherit",
  lineHeight: 0,
  minWidth: "50px",
  marginLeft: 10,
});


function PlayerList(roomId) {
  const { ablyClient, userId, userColor, nickname } = useAuth();
  const [ablyReady, setAblyReady] = useState(false);

  const [players, setPlayers] = useState([]);
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
          

          // Subscribe to presence events for members leaving the room
          await channel.presence.subscribe('leave', (member) => {
            console.log(member.clientId, "left the room");
            //if (players.includes(member.clientId)) {
              setPlayers((prevPlayers) => prevPlayers.filter(player => player !== member.clientId));
            //}
          });
          //console.log("before", players);
          await channel.presence.enter();
          const members = await channel.presence.get();
          let existingMembers = members.map(member => member.clientId);
          
          //let isFirstOneFiltered = false;
          //existingMembers = existingMembers.filter(member => {  
          //if (member === '1' && !isFirstOneFiltered) {
          //  isFirstOneFiltered = true;
          //  return false;
          //}
          //  return true;
          //});
          existingMembers = Array.from(new Set(existingMembers));
          // Update player list with existing members
          setPlayers(existingMembers);
          //console.log("after", players);
        } catch (error) {
          console.error("Error getting current members:", error);
          // You might want to handle the error more gracefully here
        }
      } else {
        console.log("Ably client not initialized.");
      }
    };

    fetchMembers();
    //console.log("after after", players);
    // Return a cleanup function if needed
    return () => {
      // Perform cleanup actions here if necessary
    };
  }, [roomId, ablyClient]); 
    async function handleKick(roomCode, player) {
    console.log("Kicking player:", player);
    const channel = ablyClient.channels.get(`room:${roomCode}`);
    channel.presence.leave(player);
    //setPlayers(players.filter(p => p !== player));
    await ablyClient.channels.get(`user:${player}`).publish('kick', { message: 'You have been kicked from the room.' });
  }
  {/*
  useEffect(() => {
    const kickMembers = async () => {
    if (ablyClient) {
      const channel = ablyClient.channels.get(`room:${roomId}`);
    // Subscribe to kick messages
      channel.subscribe('kick', (message) => {
      console.log('Kick message:', message);
      // Navigate user back to homepage
      navigate('/home');
    });
    await channel.detach();
    const onGrid = (grid) => {
      console.log("Grid received:", grid);
      setGrid(grid.data.grid);
    };
  channel.subscribe("grid", onGrid);
    }else {
      console.log("Ably client not initialized.");
    }
  };
  kickMembers();
  
    return () => {
      // Unsubscribe from kick messages when component unmounts
      const channel = ablyClient.channels.get(`room:${roomId}`);
      channel.unsubscribe();
    };
  }, [ablyClient, roomId]);

*/}
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

  // PlayerList implementation goes here
  return (
  <ThemeProvider theme={theme}>
    <div className="players-list">
      <div>
        <h2>Player List</h2>
        <ul>
          {players.map(player => (
            <div>
             <li key={player}>{player} 
              <StyledButton onClick={() => handleKick(roomId, player)}>Kick</StyledButton>
              <StyledButton onClick={() => handleBan(roomId, player)}>Ban</StyledButton>
             </li>
           </div>
          ))}
        </ul>
      </div>
    </div>
    </ThemeProvider>
  );
}

export default PlayerList;
