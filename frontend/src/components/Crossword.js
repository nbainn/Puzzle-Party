import React, { useState, useEffect } from 'react';
import './Crossword.css'

const CrosswordGrid = () => {
  const numRows = 10;
  const numCols = 10;

  const [grid, setGrid] = useState(Array(numRows).fill(Array(numCols).fill('')));
  const [currentDirection, setCurrentDirection] = useState('across'); // 'across' or 'down'

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.keyCode === 32) { // Spacebar key
        setCurrentDirection(currentDirection === 'across' ? 'down' : 'across');
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentDirection]);

  const handleCellClick = (rowIndex, colIndex) => {
    // Handle cell click based on current direction
    // For example, you can highlight the current word or input letters
    console.log(`Clicked on cell (${rowIndex}, ${colIndex}) in ${currentDirection} direction`);
  };

  return (
    <div className="crossword-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${currentDirection === 'across' ? 'across' : 'down'}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CrosswordGrid;

