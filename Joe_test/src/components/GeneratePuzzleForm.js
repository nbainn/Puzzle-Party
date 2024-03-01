import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./generatePuzzleForm.css";
//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";

function GeneratePuzzleForm() {
  const [seed, setSeed] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting\
    try {
      const response = await axios.post("/puzzle", { seed });
      if (response.status === 200) {
        console.log("Puzzle Received", response.data);
      } else if (response.status === 404) {
        console.log("Error", response.data);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error contacting server", error);
      console.log("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="generate-puzzle-form">
      <input
        type="text"
        placeholder="Enter Puzzle Seed"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
        minLength="6"
        maxLength="10"
        className="generate-puzzle-input"
      />
      <button type="submit" className="generate-puzzle-button">
        Generate Puzzle
      </button>
    </form>
  );
}

export default GeneratePuzzleForm;
