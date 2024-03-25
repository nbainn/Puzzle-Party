import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cheating.css";
import catSleep from "../assets/PartyCatSleep.gif";

//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";

function Cheating() {
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
        <button type="button">Get Hint</button>
        <button type="button">Check Word</button>
        <button type="button">Check Grid</button>
      </div>
    </div>
  );
}

export default Cheating;
