import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cheating.css";
import catSleep from "../assets/PartyCatSleep.gif";

//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";

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
    <div className="cheating">
      <div className="image-container">
        <img
          src={catSleep}
          alt="Your Animated GIF"
          className="pixelated-image"
        />
      </div>
      <div className="button-container">
        <button type="button" onClick={handleRevealHint}>
          Get Hint
        </button>
        <button type="button" onClick={handleCheckWord}>
          Check Word
        </button>
        <button type="button" onClick={handleCheckGrid}>
          Check Grid
        </button>
        <button type="button" onClick={handleRevealGrid}>
          Reveal Grid
        </button>
      </div>
    </div>
  );
}

export default Cheating;
