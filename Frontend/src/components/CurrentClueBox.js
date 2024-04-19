import React, { useRef, useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const CurrentClueBox = ({ currentClue }) => {
  const ClueBox = styled("label")({
    padding: "10px",
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: "4px",
    border: "2px solid #000",
    marginTop: "5px",
    marginLeft: "5px",
  });
  const Label = styled("div")({
    position: "absolute",
    top: "-5px",
    left: "-5px",
    backgroundColor: "#7e9eee",
    color: "white",
    padding: "4px",
    borderRadius: "4px",
    zIndex: "9999",
    marginTop: "5px",
    marginLeft: "5px",
  });

  return (
    <ClueBox>
      <Label>Current Clue</Label>
      {currentClue}
    </ClueBox>
  );
};

export default CurrentClueBox;
