import React, { useRef, useState, useEffect } from "react";
import { TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import catSleep from "../assets/PartyCatSleep.gif";
import axios from "axios";

const CurrentClueBox = ({ currentClue }) => {
  const ClueBox = styled("label")({
    padding: "10px",
    backgroundColor: "#fff",
    width: "100%",
    height: "50px",
    borderRadius: "4px",
    border: "2px solid #000",
    marginTop: "85px",
    marginLeft: "0px",
    overflow: "visible",
  });
  const Label = styled("div")({
    position: "absolute",
    top: "75px",
    left: "-5px",
    backgroundColor: "#7e9eee",
    color: "white",
    padding: "4px",
    borderRadius: "4px",
    zIndex: "997",
    marginTop: "5px",
    marginLeft: "5px",
  });
  const CatGif = styled("img")({
    position: "absolute",
    top: "0px",
    right: "85px",
    zIndex: "998",
  });

  return (
    <ClueBox>
      <Label>Current Clue</Label>
      <CatGif src={catSleep} alt="catSleep" />
      {currentClue}
    </ClueBox>
  );
};

export default CurrentClueBox;
