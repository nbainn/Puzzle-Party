import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cheating.css";
import catSleep from "../assets/PartyCatSleep.gif";
import { styled, createTheme, ThemeProvider  } from "@mui/material/styles";
import { Button, ButtonGroup } from "@mui/material";

//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";
const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", // Use the browser's default font family
  },
});
const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#DDE4FF",
  border: "1px solid #7D9CCE",
  color: "black",
  //size of button
  fontSize: "100%",
  lineHeight: 1,
  fontFamily: "inherit",
  marginTop: 5,
  marginRight: 0
});


function Cheating({
  setRevealGrid,
  setRevealHint,
  setCheckWord,
  setCheckGrid,
}) {
  const handleRevealGrid = () => {
    setRevealGrid(true);
  };

  const handleRevealHint = () => {
    setRevealHint(true);
  };

  const handleCheckWord = () => {
    setCheckWord(true);
  };

  const handleCheckGrid = () => {
    setCheckGrid(true);
  };

  return (
  <ThemeProvider theme={theme}>
    <div className="cheating">
      <div className="button-container">
        <ButtonGroup size="small" aria-label="Small button group">
        <StyledButton onClick={handleRevealHint}>
          Get Hint
        </StyledButton>
        <StyledButton onClick={handleCheckWord}>
          Check Word
        </StyledButton>
        <StyledButton onClick={handleCheckGrid}>
          Check Grid
        </StyledButton>
        <StyledButton onClick={handleRevealGrid}>
          Reveal Grid
        </StyledButton>
        </ButtonGroup>
        
      </div>
    </div>
  </ThemeProvider>
  );
}

export default Cheating;
