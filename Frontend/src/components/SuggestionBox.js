import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import "./SuggestionBox.css";
import axios from "axios";

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]",
  },
});

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#DDE4FF",
  border: "1px solid #7D9CCE",
  color: "black",
  //size of button
  fontSize: "15px",
  fontFamily: "inherit",
  lineHeight: 1,
  minWidth: "50px",
  marginTop: "10px",
});

function SuggestionBox() {
  const [word, setWord] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (word !== "" && description !== "") {
      try {
        const response = await axios.post("/suggestion", { word, description });
        if (response.status === 200) {
          setWord(""); // Clear word input field
          setDescription(""); // Clear description input field
          console.log("suggestion sent!");
          alert("Suggestion sent!");
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
    // Add code here to submit the suggestion
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <h2>Submit Suggestion</h2>
        <form onSubmit={handleSubmit} autocomplete="off">
          <div>
            <label htmlFor="wordInput">Word:</label>
            <br></br>
            <TextField
              autocomplete="off"
              id="wordInput"
              type="text"
              value={word}
              onChange={(event) => setWord(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="descriptionInput">Description:</label>
            <br></br>
            <TextField
              autocomplete="off"
              id="descriptionInput"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <StyledButton type="submit">Submit Suggestion</StyledButton>
        </form>
      </div>
    </ThemeProvider>
  );
}

export default SuggestionBox;
