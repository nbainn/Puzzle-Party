import React, { useState } from "react";
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

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  /*const handleTimerChange = () => {
    setTimer(!timerEnabled);
    setTimerEnabled(!timerEnabled);
  };

  const handleHintsChange = () => {
    setHints(!hintsEnabled);
    setHintsEnabled(!hintsEnabled);
  };

  const handleGuessesChange = () => {
    setGuesses(!guessesEnabled);
    setGuessesEnabled(!guessesEnabled);
  };*/

  const handleTimerChange = () => {
    setTimer(!timer);
    console.log("Timer: ", timer);
  };

  const handleHintsChange = () => {
    setHints(!hints);
    console.log("Hints: ", hints);
  };

  const handleGuessesChange = () => {
    setGuesses(!guesses);
    console.log("Guesses: ", guesses);
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
              checked={timer}
              onChange={handleTimerChange}
            />
            Enable Timer
          </label>
          <label>
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
