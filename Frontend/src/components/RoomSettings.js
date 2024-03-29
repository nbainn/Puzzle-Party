import React, { useState } from 'react';
import './RoomSettings.css'; // You can create this CSS file to style your popup

function RoomSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [guessesEnabled, setGuessesEnabled] = useState(true);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleTimerChange = () => {
    setTimerEnabled(!timerEnabled);
  };

  const handleHintsChange = () => {
    setHintsEnabled(!hintsEnabled);
  };

  const handleGuessesChange = () => {
    setGuessesEnabled(!guessesEnabled);
  };

  return (
    <div className="settings-popup">
      <button onClick={togglePopup} className="settings-button">
        ⚙️
      </button>
      {isOpen && (
        <div className="popup-content">
          <h2>Settings</h2>
          <label>
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={handleTimerChange}
            />
            Enable Timer
          </label>
          <label>
            <input
              type="checkbox"
              checked={hintsEnabled}
              onChange={handleHintsChange}
            />
            Enable Hints
          </label>
          <label>
            <input
              type="checkbox"
              checked={guessesEnabled}
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