import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./generatePuzzleForm.css";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ButtonGroup,
} from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";
import catSleep from "../assets/PartyCatSleep.gif";

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
  marginLeft: 10,
  fontFamily: "inherit",
});

const StyledGroup = styled(ButtonGroup)({
  marginTop: "-5px",
});

const StyledSelect = styled(Select)({
  backgroundColor: "#DDE4FF",
  border: "1px solid #7D9CCE",
  color: "black",
  fontSize: "100%",
  lineHeight: 1,
  marginLeft: 10,
  height: 55,
  fontFamily: "C&C Red Alert [INET]",
});

const StyledMenuItem = styled(MenuItem)({
  fontFamily: "C&C Red Alert [INET]",
});

function GeneratePuzzleForm({ setPuzzle, setAcross, setDown, userId }) {
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
  useEffect(() => {
    try {
      const handleNewPuzzle = async () => {
        try {
          const response = await axios.post("/addPlay", {
            userId: userId,
          });
          if (response.status === 200) {
            console.log("game played added!");
          } else if (response.status === 404) {
            console.log("User", userId, "not found");
            console.log("Error", response.data);
          } else {
            console.error("Unexpected response status:", response.status);
          }
        } catch (error) {
          console.error("Error contacting server", error);
          console.log("error");
        }
      };
      if (typeof userId !== "string") {
        handleNewPuzzle();
      }
    } catch (error) {
      console.error("Error contacting server", error);
      console.log("error");
    }
  }, [seed, size, userId]);

  const generateRandomNumber = () => {
    // Generate a random number between 0 and 9999999999
    const randomNumber = Math.floor(Math.random() * 10000000000);

    // Set the generated random number to the input field
    setSeed(randomNumber.toString());
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <form onSubmit={handleSubmit} className="generate-puzzle-form">
          <TextField
            id="seedInput"
            type="number"
            placeholder="Enter Seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            min="0"
            max="9999999999"
            className="generate-puzzle-input"
            sx={{
              width: "128px",
              "& input": {
                height: "30px",
                padding: "0px 12px", // Adjust padding for better visual alignment
                fontSize: "1rem", // Adjust font size for better text alignment
              },
            }}
          />
          <StyledSelect
            id="sizeDropdown"
            value={size}
            label="Size"
            onChange={handleSizeChange}
            sx={{ height: "30px" }}
          >
            <StyledMenuItem value={"small"}>Small</StyledMenuItem>
            <StyledMenuItem value={"medium"}>Medium</StyledMenuItem>
            <StyledMenuItem value={"large"}>Large</StyledMenuItem>
          </StyledSelect>

          <ButtonGroup
            sx={{
              display: "flex",
              justifyContent: "left",
              marginTop: "5px",
              marginLeft: "16px",
            }}
          >
            <StyledButton onClick={generateRandomNumber}>
              Randomize
            </StyledButton>
            <StyledButton type="submit" className="generate-puzzle-button">
              Generate
            </StyledButton>
          </ButtonGroup>
        </form>
      </div>
    </ThemeProvider>
  );
}
/*  <div className="image-container">
          <img
            src={catSleep}
            alt="Your Animated GIF"
            className="pixelated-image"
          />
        </div> */
export default GeneratePuzzleForm;
