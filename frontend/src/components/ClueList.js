import React from 'react';
import './ClueList.css';

function ClueList() {
  // Example clues for demonstration
  const acrossClues = [
    '1. A common pet',
    '3. Not day',
    '5. Opposite of buy',
    '7. Skull Emoji',
    '9. Crying Emoji',
    // Add more clues as needed
  ];

  const downClues = [
    '2. A place for cooking',
    '4. To perceive sound',
    '6. A type of fruit',
    '8. A cool thingy',
    '10. A not cool thingy',
    // Add more clues as needed
  ];

  return (
    <div className="clue-list-container">
      <div className="clue-section">
        <h3 className="clue-header">Across</h3>
        <ul className="clue-list">
          {acrossClues.map((clue, index) => (
            <li key={index}>{clue}</li>
          ))}
        </ul>
      </div>
      <div className="clue-section">
        <h3 className="clue-header">Down</h3>
        <ul className="clue-list">
          {downClues.map((clue, index) => (
            <li key={index}>{clue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ClueList;
