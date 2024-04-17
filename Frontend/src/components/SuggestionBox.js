import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField,  Button} from "@mui/material";
import { styled, createTheme, ThemeProvider  } from "@mui/material/styles";
import "./SuggestionBox.css";
import axios from "axios";

const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", 
  },
});

const StyledButton = styled(Button)({
  //background color of button
  backgroundColor: "#ffcaca",
  border: "1px solid #ca8f8f",
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
    if (setWord !== "" && setDescription !== "") {
      try {
        const response = await axios.post("/suggestion", { word, description });
        if (response.status === 200) {
          console.log("suggestion sent!");
          alert("Suggestion sent!")
        } else if (response.status === 404) {
          console.log("Error", response.data);
        } else {
          console.error("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("Error contacting server", error);
        console.log("error");
      }
      setWord("");
      setDescription("");
    }
    // Add code here to submit the suggestion
  };

  return (
    <ThemeProvider theme={theme}>
    <div>
      <h2>Submit Suggestion</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="wordInput">Word:</label>
          <br></br>
          <TextField
            id="wordInput"
            type="text"
            value={word}
            onChange={(event) => setWord(event.target.value)}
            autocomplete="off"
          />
        </div>
        <div>
          <label htmlFor="descriptionInput">Description:</label>
          <br></br>
          <TextField
            id="descriptionInput"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            autocomplete="off"
          />
        </div>
        <StyledButton type="submit">Submit Suggestion</StyledButton>
      </form>
    </div>
    </ThemeProvider>
  );
}

export default SuggestionBox;
