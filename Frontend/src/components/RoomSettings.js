import React, { useState, useEffect } from "react";
import "./RoomSettings.css"; // You can create this CSS file to style your popup

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
      <label>{timer && <p>Time left: {timeLeft} seconds</p>}</label>
      <button onClick={togglePopup} className="settings-button">
        ⚙️
      </button>
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
