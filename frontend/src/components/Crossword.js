import React, { useState, useEffect } from 'react';
import './Crossword.css'; // You can define your own CSS for styling

const CrosswordGrid = () => {
  const numRows = 10;
  const numCols = 10;

  const [grid, setGrid] = useState(
    Array(numRows).fill(Array(numCols).fill({ value: '', highlighted: false }))
  );
  const [currentDirection, setCurrentDirection] = useState('across'); // 'across' or 'down'
  const [currentWordStart, setCurrentWordStart] = useState(null);
  const [currentWordEnd, setCurrentWordEnd] = useState(null);
  const [inputChar, setInputChar] = useState('');
  const [favcolor, setColor] = useState('#e08794');

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
  // Reset highlighting
  const resetGrid = grid.map(row =>
    row.map(cell => ({ ...cell, highlighted: false }))
  );
  setGrid(resetGrid);

  // Highlight cells in the current direction
  const newGrid = resetGrid.map((row, rIndex) =>
    row.map((cell, cIndex) => {
      if (currentDirection === 'across' && rIndex === rowIndex) {
        return { ...cell, highlighted: true };
      }
      if (currentDirection === 'down' && cIndex === colIndex) {
        return { ...cell, highlighted: true };
      }
      return cell;
    })
  );
  setGrid(newGrid);

  // Update current word
  setCurrentWordStart(findWordStart(rowIndex, colIndex));
  setCurrentWordEnd(findWordEnd(rowIndex, colIndex));
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
  const newGrid = grid.map((row, rIndex) => rIndex === rowIndex
      ? row.map((cell, cIndex) =>
          cIndex === colIndex ?  { ...cell, value: event.target.value } : cell
        )
      : row
  );
  setGrid(newGrid);
};


  return (
    <div className="crossword-grid">
      <div className='color-picker'>
        <label for="favcolor">Select your Cursor Color:</label>
        <input type="color" id="favcolor1" name="favcolor" value="#e08794" 
          onChange={(e) => setColor(e.target.value)}></input>
      </div>

      <div className='grid'>
        {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
          <input
            key={`${rowIndex}-${colIndex}`}
            className={`cell ${isCellInCurrentWord(rowIndex, colIndex) ? 'current-word' : ''}`}
            value={cell.value}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            onChange={(event) => handleCellChange(event, rowIndex, colIndex)}
            maxLength={1}
            style={{ backgroundColor: cell.highlighted ? favcolor : 'white' }}
          />

          ))}
        </div>
        ))}
      </div>
      
    </div>
  );
};

export default CrosswordGrid;
