import React, { useState, useEffect } from "react";
import "./RoomSettings.css"; // You can create this CSS file to style your popup

import { styled } from "@mui/material/styles";
import { Button, ButtonGroup } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import  axios  from 'axios';

const StyledButton = styled(Button)({
  fontSize: "1rem",
  color: "black",
  fontFamily: "inherit",
});
const StyledButtonGroup = styled(ButtonGroup)({
  color: "black",
});


function RoomSettings({
  timer,
  hints,
  guesses,
  setTimer,
  setHints,
  setGuesses,
  roomId, 
  ablyClient
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Initial time left in seconds

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
  useEffect(() => {
    if (timer && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [timer, timeLeft]);
    const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch the initial status of the room from the database
    const fetchRoomStatus = async () => {
      try {
        const response = await axios.post('/room-status', {roomId});
        //console.log('response.data', response.data);
        const pub_stat= response.data;
        console.log('pub_stat', pub_stat);
        setStatus(pub_stat === true ? 'public' : 'private');
      } catch (error) {
        console.error('Error fetching room status:', error);
        setStatus('public');
      }
    };

    fetchRoomStatus();
  }, [roomId]);

  const handleRoomStatus = async(event) => {
    event.preventDefault();
    setStatus(prevStatus => (prevStatus === 'public' ? 'private' : 'public'));
    try {// Generate a 6-digit room code and navigate to the RoomPage
        await axios.post('/change-status', { roomId: roomId, status: status });
      } catch (error) {
        console.error('Could not change status:', error)
      }
  };


  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleTimerChange = () => {
    setTimer(!timer);
  };

  const handleHintsChange = () => {
    setHints(!hints);
  };

  const handleGuessesChange = () => {
    setGuesses(!guesses);
  };

  return (
    <div className="settings-popup">
      
      <label>{timer && <h2>Time left: {timeLeft} seconds</h2>}</label>
      <StyledButtonGroup size="small" variant="text" aria-label="Small button group">
      <StyledButton variant = "text" onClick={togglePopup} className="settings-button">
        ⚙️
      </StyledButton>
      <StyledButton variant = "text" onClick={handleExitRoom} className="exit-room-button">
        Exit Room
      </StyledButton>
      <StyledButton variant = "text" onClick={handleRoomStatus} className="room-status-button">
      {status === 'public' ? 'Public' : 'Private'}
      </StyledButton>
      </StyledButtonGroup>
      {isOpen && (
        <div className="popup-content">
          <h2>Settings</h2>
          <label>
            <input
              type="checkbox"
              checked={timer}
              onChange={handleTimerChange}
            />
            Enable Timer
            <input
              type="checkbox"
              checked={hints}
              onChange={handleHintsChange}
            />
            Enable Hints
          </label>
          <label>
            <input
              type="checkbox"
              checked={guesses}
              onChange={handleGuessesChange}
            />
            Enable Guesses
          </label>
        </div>
      )}
    </div>
  );
}

export default RoomSettings;
