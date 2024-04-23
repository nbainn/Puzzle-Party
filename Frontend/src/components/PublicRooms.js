import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import "./PublicRooms.css"; // Importing CSS for PublicRooms
import { join } from "path-browserify";
import axios from "axios";
import cat from '../assets/public_cat.png';
import { List, ListItem, ListItemButton } from "@mui/material";
import { useAuth } from "../hooks/useAuth";


function PublicRooms() {
  //createHost();
  //const host = createHost();
  //console.log("Adding peerID", host)
  const { ablyClient, userId, userColor, nickname, isGuest } = useAuth();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("/find-rooms", {
          params: {
            limit: 10,
          },
        });
        console.log('Got rooms:', response.data);
        let str = '' + userId;
        const filteredRooms = response.data.filter(room => { 
          return !room.banned_players || !room.banned_players.includes(str);
        });
        setRooms(filteredRooms);
      } catch (error) {
        console.error("Could not get rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleJoin = async (roomCode) => {
    navigate(`/room/${roomCode}`);
    //check if they are banned
  };

  return (
    <div className="room-page">
      <div className="public-room-header">
        <h4>Public Rooms</h4>
      </div>
      <div className="room-list">
        {/* Render the list of rooms */}
        <div style={{ display: "flex" }}>
        <List>
          {rooms.map((room) => (
            <ListItem key={room.id} disablePadding sx = {{ border: "1px solid #BD7784", marginLeft: "3rem", width: "20rem", padding: "1%", borderRadius: "4px"}}>
              <ListItemButton onClick = {() => handleJoin(room.room_code)}>
                Room Code: {room.room_code}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <img src = {cat} alt = "cat" style = {{width: "50%", height: "50%", marginLeft: "20rem"}}/>
        </div>
      </div>
    </div>
  );
}

export default PublicRooms;
