import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SuggestionBox.css";
import axios from "axios";

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
    <div>
      <h2>Submit Suggestion</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="wordInput">Word:</label>
          <input
            id="wordInput"
            type="text"
            value={word}
            onChange={(event) => setWord(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="descriptionInput">Description:</label>
          <input
            id="descriptionInput"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <button type="submit">Submit Suggestion</button>
      </form>
    </div>
  );
}

export default SuggestionBox;
