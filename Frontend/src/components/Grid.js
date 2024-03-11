import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

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

// Main Grid component
function Grid() {
  // State to store the grid data (characters in each cell)
  // Backend may need to initialize this state with puzzle data of different sizes (small, medium, large)
  const [grid, setGrid] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill('')));
  
  // State for responsive grid size
  const [size, setSize] = useState(300);

  // Handles input changes in grid cells
  // Updates the grid state, converting input to uppercase for standardization
  // Backend needs to handle these changes for game logic and data persistence
  const handleInputChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value.toUpperCase() : cell))
    );
    setGrid(newGrid);
  };

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

  // Rendering the grid with input fields
  // Backend may need to interact with this for validations and updates
  return (
    <GridContainer size={size}>
      {grid.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <GridCell key={`${rowIndex}-${colIndex}`}>
            <InputWrapper>
              <StyledInput
                value={cell}
                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                inputProps={{ maxLength: 1 }}
                variant="outlined"
                size="small"
                placeholder=" "
              />
            </InputWrapper>
          </GridCell>
        ))
      ))}
    </GridContainer>
  );
}

export default Grid;
