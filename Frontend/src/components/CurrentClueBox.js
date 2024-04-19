import React, { useRef, useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const CurrentClueBox = ({ currentClue }) => {
  const ClueBox = styled("label")({
    padding: "10px",
    backgroundColor: "#fff",
  });

  return <ClueBox>{currentClue}helllelelelelelelele</ClueBox>;
};

export default CurrentClueBox;
