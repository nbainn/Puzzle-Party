import React, { useState, useEffect } from 'react';
import './Crossword.css'; // You can define your own CSS for styling

const CrosswordGrid = () => {
  const numRows = 10;
  const numCols = 10;

  const [grid, setGrid] = useState(Array(numRows).fill(Array(numCols).fill('')));
  const [currentDirection, setCurrentDirection] = useState('across'); // 'across' or 'down'
  const [currentWordStart, setCurrentWordStart] = useState(null);
  const [currentWordEnd, setCurrentWordEnd] = useState(null);
  const [inputChar, setInputChar] = useState('');

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

  const handleCellClick = (event, rowIndex, colIndex) => {
    // Handle cell click based on current direction
    // For example, you can highlight the current word or input letters
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = event.target.value;
    setGrid(newGrid);
    setInputChar('');

    // Highlight current word
    const wordStart = findWordStart(rowIndex, colIndex);
    const wordEnd = findWordEnd(rowIndex, colIndex);
    setCurrentWordStart(wordStart);
    setCurrentWordEnd(wordEnd);
  };

  const findWordStart = (rowIndex, colIndex) => {
    let i = colIndex;
    let j = rowIndex;

    while (i > 0 && grid[j][i - 1] !== '' && (currentDirection === 'across' || j === rowIndex)) {
      i--;
    }

    while (j > 0 && grid[j - 1][colIndex] !== '' && (currentDirection === 'down' || i === colIndex)) {
      j--;
    }

    return [j, i];
  };

  const findWordEnd = (rowIndex, colIndex) => {
    let i = colIndex;
    let j = rowIndex;

    while (i < numCols - 1 && grid[j][i + 1] !== '' && (currentDirection === 'across' || j === rowIndex)) {
      i++;
    }

    while (j < numRows - 1 && grid[j + 1][colIndex] !== '' && (currentDirection === 'down' || i === colIndex)) {
      j++;
    }

    return [j, i];
  };

  const isCellInCurrentWord = (rowIndex, colIndex) => {
    if (!currentWordStart || !currentWordEnd) return false;
    const [startRow, startCol] = currentWordStart;
    const [endRow, endCol] = currentWordEnd;
    return rowIndex >= startRow && rowIndex <= endRow && colIndex >= startCol && colIndex <= endCol;
  };

  const handleCellChange = (event, rowIndex, colIndex) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = event.target.value;
    setGrid(newGrid);
  };

  return (
    <div className="crossword-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              value={cell}
              onChange={(event) => handleCellClick(event, rowIndex, colIndex)}
              maxLength={1}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default CrosswordGrid;
