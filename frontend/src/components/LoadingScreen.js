import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const LoadingScreen = ({ message }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      style={{ 
        height: '100vh', 
        backgroundColor: '#ffad9d', 
        //fontFamily: "'Bubblegum Sans', cursive" 
      }}
    >
      <CircularProgress />
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