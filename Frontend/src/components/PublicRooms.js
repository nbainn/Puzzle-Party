import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import "./PublicRooms.css"; // Importing CSS for PublicRooms
import { join } from "path-browserify";
import axios from "axios";

function PublicRooms() {
  //createHost();
  //const host = createHost();
  //console.log("Adding peerID", host)
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
        //console.log('Got rooms:', response.data);
        setRooms(response.data);
      } catch (error) {
        console.error("Could not get rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleJoin = (roomCode) => {
    navigate(`/room/${roomCode}`);
    //check if they are banned
  };

  return (
    <div className="room-page">
      <div className="room-header">
        <h2>Public Rooms</h2>
      </div>
      <div className="room-list">
        {/* Render the list of rooms */}
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <span>
                Room Code: {room.room_code}, Host: {room.host}
              </span>
              <button onClick={() => handleJoin(room.room_code)}>Join</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PublicRooms;
