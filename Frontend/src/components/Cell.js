import React, { useRef, useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Styling for each cell in the grid
// Cells maintain a 1:1 aspect ratio for a square appearance
const GridCell = styled(Box)({
  position: "relative",
  backgroundColor: "#fff", // White background for cells
  border: "2px solid #545454", // Border for visual separation of cells
  "&:after": {
    content: '""',
    display: "block",
    paddingBottom: "100%", // Maintains square shape
  },
  visibility: "visible",
});

// Wrapper for the input field within each grid cell
// Centers the input field within the cell
const InputWrapper = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

// Customized input field for entering crossword characters
const StyledInput = styled(TextField)(({ fontsize }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  userSelect: "none", // Prevents user selection of text
  zIndex: 1,
  padding: "0px",
  "& input": {
    fontFamily: "inherit",
    textAlign: "center",
    fontSize: `${fontsize}rem`,
    padding: "0",
    "&::placeholder": {
      fontSize: "1.5rem",
      fontFamily: "inherit",
    },
  },
  "& .MuiOutlinedInput-root": {
    height: "100%",
    "& fieldset": {
      border: "none", // Hides default border to blend with cell border
    },
  },
  "&::selection": {
    background: "transparent", // Prevent text selection
  },
}));

const WordNumber = styled("label")(({ numSize }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "15px", // Set the width to 100 pixels
  height: "15px",
  pointerEvents: "none",
  color: "#000000",
  zIndex: 999,
  marginLeft: "2px",
  marginTop: "-2px",
  padding: "0px",
  fontSize: `${numSize}rem`,
}));

//cells get passed data from the crossword component and decide how to render themselves\
//cells are the smallest unit of the crossword

const areEqual = (prevProps, nextProps) => {
  // Compare only the 'cell' prop for changes
  return (
    prevProps.cell === nextProps.cell &&
    prevProps.favColor === nextProps.favColor
  );
};

const Cell = React.memo(
  ({
    cell,
    userId,
    rowIndex,
    colIndex,
    handleKeyPress,
    handleCellClick,
    favColors,
    favColor,
    numRows,
  }) => {
    //cell: {
    //value: ,
    //hidden: ,
    //number: ,
    //flagged: ,
    //players_primary: [],
    //players_secondary: [],
    //}

    //converts from hex to rgba
    function hexToRGBA(hex, alpha) {
      hex = hex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    //return value of cell **************************************
    return (
      <GridCell
        style={{
          visibility: cell.hidden ? "hidden" : "visible",
        }}
      >
        <InputWrapper>
          <StyledInput
            autoComplete="off"
            fontsize={numRows === 15 ? 1.3 : numRows === 10 ? 1.7 : 3.2}
            id={`${rowIndex}-${colIndex}`}
            key={`${rowIndex}-${colIndex}`}
            value={cell.value}
            onClick={() => {
              //setLocation(rowIndex, colIndex);
              //setRefresh(!refresh);
              handleCellClick(rowIndex, colIndex);
              document.getElementById("input-controller").focus();
            }}
            maxLength={1}
            style={{
              cursor: "pointer",
              backgroundColor: cell.flagged
                ? "#ffd76b"
                : cell.players_primary.length > 0
                ? cell.players_primary.includes(userId)
                  ? hexToRGBA(favColor, 1)
                  : hexToRGBA(favColors[cell.players_primary[0]], 1)
                : cell.players_secondary.length > 0
                ? cell.players_secondary.includes(userId)
                  ? hexToRGBA(favColor, 0.5)
                  : hexToRGBA(favColors[cell.players_secondary[0]], 0.5)
                : "white",
              caretColor: "transparent",
            }}
          />
          <WordNumber numSize={numRows === 15 ? 0.8 : numRows === 10 ? 1.1 : 2}>
            {cell.number == 0 ? "" : cell.number}
          </WordNumber>
        </InputWrapper>
      </GridCell>
    );
  },
  areEqual
);

export default Cell;
