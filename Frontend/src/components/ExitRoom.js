import React from 'react';
import './ExitRoom.css'; 
import { useNavigate } from 'react-router-dom';

function ExitRoom({roomId, ablyClient}) {
  const navigate = useNavigate();

  const handleExitRoom = async (event) => {
    const channel = ablyClient.channels.get(`room:${roomId}`);
    event.preventDefault();
    //channel.unsubscribe('myEvent', myListener);
    /* remove the listener registered for all events */
    //channel.unsubscribe(myListener);
    await channel.detach();
    navigate(`/home`);
  };

  return (
    <div className="exit-room">
      <button onClick={handleExitRoom} className="exit-room-button">
        Exit Room
      </button>
    </div>
  );
}

export default ExitRoom;