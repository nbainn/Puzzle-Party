import React, { useState } from "react";
import "./SuggestionBox.css";

function SuggestionBox() {
  const [word, setWord] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Word: ${word}, Description: ${description}`);
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
