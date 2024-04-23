import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import CatRun from "../assets/CatRun.gif";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const LoadingScreen = ({ message }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{
        height: "100vh",
        backgroundColor: '#ffcad4',
        //fontFamily: "'Bubblegum Sans', cursive"
      }}
    >
      <img src={CatRun} alt="Cat Running" style={{ width: 200 }} />
      {message && (
        <Typography
          variant="h6"
          style={{
            marginTop: 20,
            //fontFamily: "'Bubblegum Sans', cursive"
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingScreen;
