import React, { useState } from 'react';
import './Grid.css';

function Grid() {
  // Define the grid size
  const gridSize = 10;
  
  // Initialize the grid state
  const [grid, setGrid] = useState(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(''))
  );

  // Handle input change for grid cells
  const handleInputChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value.toUpperCase() : cell))
    );
    setGrid(newGrid);
  };

  return (
    <div className="crossword-container">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((cell, colIndex) => (
            <div key={colIndex} className="grid-cell">
              <input
                type="text"
                maxLength="1"
                value={cell}
                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Grid;