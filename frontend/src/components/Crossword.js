import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import './Crossword.css'; // You can define your own CSS for styling
// gridSize can be dynamically set in the future based on user preference for small, medium, or large puzzles
const gridSize = 10; 

// Styling for the grid container using Material UI
// Uses CSS grid layout to organize cells, with flexibility to accommodate different grid sizes
const GridContainer = styled(Box)(({ size }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
  gap: '1px', // Uniform gap between cells for visual clarity
  padding: '10px',
  maxWidth: '100%',
  margin: 'auto',
  width: `${size}px`, // Dynamic width based on screen size
}));

// Styling for each cell in the grid
// Cells maintain a 1:1 aspect ratio for a square appearance
const GridCell = styled(Box)({
  position: 'relative',
  backgroundColor: '#fff', // White background for cells
  border: '1px solid #ddd', // Border for visual separation of cells
  '&:after': {
    content: '""',
    display: 'block',
    paddingBottom: '100%', // Maintains square shape
  },
});

// Wrapper for the input field within each grid cell
// Centers the input field within the cell
const InputWrapper = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

// Customized input field for entering crossword characters
const StyledInput = styled(TextField)({
  width: '100%', 
  height: '100%',
  '& input': {
    textAlign: 'center',
    fontSize: '1.5rem',
    padding: '0',
    '&::placeholder': {
      fontSize: '1.5rem',
    },
  },
  '& .MuiOutlinedInput-root': {
    height: '100%',
    '& fieldset': {
      border: 'none', // Hides default border to blend with cell border
    },
  },
});



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
  // State for responsive grid size
  const [size, setSize] = useState(300);


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

function hexToRGBA(hex, alpha) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
  // Dynamically updates grid size based on window dimensions
  // Ensures grid is responsive and fits within the view
  const updateGridSize = () => {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 150;
    const maxGridSize = Math.min(maxWidth, maxHeight);
    setSize(maxGridSize);
  };
  // Effect hook for responsive grid sizing
  useEffect(() => {
    window.addEventListener('resize', updateGridSize);
    updateGridSize();
    return () => {
      window.removeEventListener('resize', updateGridSize);
    };
  }, []);


  return (
    <div className="crossword-grid">
      <div className='color-picker'>
        <label for="favcolor">Select your Cursor Color:</label>
        <input type="color" id="favcolor1" name="favcolor" value="#e08794" 
          onChange={(e) => setColor(e.target.value)}></input>
      </div>

      <GridContainer size={size}>
        {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
           <GridCell key={`${rowIndex}-${colIndex}`}>
            <InputWrapper>
              <StyledInput
                className={`cell ${isCellInCurrentWord(rowIndex, colIndex) ? 'current-word' : ''}`}
                value={cell.value}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onChange={(event) => handleCellChange(event, rowIndex, colIndex)}
                maxLength={1}
                style={{ backgroundColor: cell.highlighted ?  hexToRGBA(favcolor, 0.5) : 'white' }}
                />
              </InputWrapper>
            </GridCell>

          ))}
        </div>
        ))}
      </GridContainer>
      
    </div>
  );
};

export default CrosswordGrid;
