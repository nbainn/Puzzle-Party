import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const gridSize = 10;

const GridContainer = styled(Box)(({ size }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
  gap: '1px', // This sets a uniform gap between grid cells
  padding: '10px',
  maxWidth: '100%',
  margin: 'auto',
  width: `${size}px`, // Dynamically set width of the grid container
}));

const GridCell = styled(Box)({
  position: 'relative',
  backgroundColor: '#fff', // Set the background color of each cell to white
  border: '1px solid #ddd', // Add a subtle border to each cell, adjust color as needed
  '&:after': {
    content: '""',
    display: 'block',
    paddingBottom: '100%', // This maintains a 1:1 aspect ratio
  },
});

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

const StyledInput = styled(TextField)({
  width: '100%', // Use 100% of the cell's width
  height: '100%', // Use 100% of the cell's height to fill the cell
  '& input': {
    textAlign: 'center',
    fontSize: '1.5rem', // Larger font size for visibility
    padding: '0', // Remove padding to ensure the input fills the cell
    '&::placeholder': {
      fontSize: '1.5rem', // Consistent font size for placeholders
    },
  },
  '& .MuiOutlinedInput-root': {
    height: '100%',
    '& fieldset': {
      border: 'none', // Hide the default border
    },
  },
});

function Grid() {
  const [grid, setGrid] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill('')));
  const [size, setSize] = useState(300); // Initial size of the grid

  const handleInputChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value.toUpperCase() : cell))
    );
    setGrid(newGrid);
  };

  // Function to calculate and update the grid size
  const updateGridSize = () => {
    const maxWidth = window.innerWidth - 40; // Subtract margins or padding
    const maxHeight = window.innerHeight - 150; // Subtract other components' heights and margins
    const maxGridSize = Math.min(maxWidth, maxHeight);

    // Update the size state to the lesser of maxWidth and maxHeight
    setSize(maxGridSize);
  };

  // Update the grid size on window resize
  useEffect(() => {
    window.addEventListener('resize', updateGridSize);
    updateGridSize(); // Also update the size on initial render

    return () => {
      window.removeEventListener('resize', updateGridSize);
    };
  }, []);

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
                placeholder=" " // Placeholder ensures height is calculated correctly
              />
            </InputWrapper>
          </GridCell>
        ))
      ))}
    </GridContainer>
  );
}

export default Grid;
