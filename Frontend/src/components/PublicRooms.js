import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatBox from "./ChatBox";
import "./PublicRooms.css"; // Importing CSS for PublicRooms
import { join } from "path-browserify";
import axios from "axios";

function PublicRooms() {
    //createHost();
    //const host = createHost();
    //console.log("Adding peerID", host)
    const [rooms, setRooms] = useState([]);
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('/find-rooms', { 
                    params: {
                        limit: 10
                    }
                });
                console.log('Got rooms:', response.data);
                setRooms(response.data);
            } catch (error) {
                console.error('Could not get rooms:', error)
            }
        };
        fetchRooms();
    }, []);


    return (
        <div className="room-page">
            <div className="room-header">
                <h2>Public Rooms</h2>
            </div>
            <div className="room-list">
                {/* Render the list of rooms */}
                <ul>
                    {rooms.map(room => (
                        <li key={room.id}>
                            <span>{room.name}</span>
                            {/* Add more room details here if needed */}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PublicRooms;