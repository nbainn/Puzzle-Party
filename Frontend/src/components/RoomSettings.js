import React, { useState, useEffect } from "react";
import "./RoomSettings.css"; // You can create this CSS file to style your popup

import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

const StyledButton = styled(Button)({
  fontSize: "1rem",
});

function RoomSettings({
  timer,
  hints,
  guesses,
  setTimer,
  setHints,
  setGuesses,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Initial time left in seconds

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
      <StyledButton variant = "text" onClick={togglePopup} className="settings-button">
        ⚙️
      </StyledButton>
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
