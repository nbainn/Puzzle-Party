import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./generatePuzzleForm.css";

//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";

function GeneratePuzzleForm({ setPuzzle, setAcross, setDown }) {
  const [seed, setSeed] = useState("");
  const [size, setSize] = useState("medium");

  const navigate = useNavigate();

  const handleSizeChange = (event) => {
    setSize(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Add validation for roomCode before redirecting\
    if (seed !== "") {
      try {
        const response = await axios.post("/puzzle", { seed, size });
        if (response.status === 200) {
          console.log("Puzzle Received", response.data);
          setPuzzle(response.data);
          console.log("puzzle set!");
        } else if (response.status === 404) {
          console.log("Error", response.data);
        } else {
          console.error("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("Error contacting server", error);
        console.log("error");
      }
    }
  };

  const generateRandomNumber = () => {
    // Generate a random number between 0 and 9999999999
    const randomNumber = Math.floor(Math.random() * 10000000000);

    // Set the generated random number to the input field
    setSeed(randomNumber.toString());
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="generate-puzzle-form">
        <input
          id="seedInput"
          type="number"
          placeholder="Enter Seed"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          min="0"
          max="9999999999"
          className="generate-puzzle-input"
        />
        <button type="submit" className="generate-puzzle-button">
          Generate Puzzle
        </button>
      </form>
      <button onClick={generateRandomNumber}>Randomize</button>
      <label htmlFor="sizeDropdown">&nbsp;&nbsp;Select Size:</label>
      <select id="sizeDropdown" value={size} onChange={handleSizeChange}>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>
  );
}

export default GeneratePuzzleForm;
