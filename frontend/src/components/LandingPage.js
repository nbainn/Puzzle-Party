import React, { useState, useEffect } from 'react';
import { Button, Box, Card, CardContent, Typography, Link, TextField, Container, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

function LandingPage() {
  const { login, guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [serverError, setServerError] = useState('');
  const [genericError, setGenericError] = useState('');
  const [emailError, setEmailError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    try {
      await axios.post('/login', { email, password });
      login();
      navigate('/home');
    } catch (error) {
      if (!error.response) {
        setNetworkError('Unable to connect to the server. Please try again later.');
      } else if (error.response.status === 500) {
        setServerError('Something went wrong on our end. Please try again later.');
      } else {
        setGenericError(error.response?.data?.message || 'An error occurred. Please try again.');
      }
    }
  };

  const onGoogleLoginSuccess = async (tokenResponse) => {
    console.log('Received token from Google:', tokenResponse);
    try {
      // Extract the credential from the tokenResponse object
      const token = tokenResponse.credential;
      if (!token) {
        console.error('No token found in the Google token response:', tokenResponse);
        return;
      }
      
      await axios.post('/googleLogin', { token: tokenResponse.credential });
      login();
      navigate('/home');
    } catch (error) {
      console.error('Google Login Error:', error.response?.data?.message || error.message);
    }
  };

  const handleGuest = () => {
    guestLogin();
    navigate('/home');
};

  const handleSignUp = () => {
    navigate('/signup');
  };

  const googleButtonStyle = {
    display: 'flex',
    justifyContent: 'center',
  };

  useEffect(() => {
    // If the user is authenticated, redirect them to the HomePage
    if (auth.isAuthenticated) {
      navigate('/home');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <Box
      sx={{
        backgroundColor: '#4a4159',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container component="main" maxWidth="xs" sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto'
      }}>
        <Card sx={{ p: 3, backgroundColor: '#FFE3E8' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5">
              Welcome to Puzzle Party
            </Typography>
            <Typography variant="body2">
              Don't have an account yet? <Link onClick={handleSignUp} sx={{ cursor: 'pointer' }}>Sign Up</Link>
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                variant="outlined"
                sx={{ mt: 3, backgroundColor: '#FFFFFF' }}
                error={Boolean(emailError)}
                helperText={emailError}
              />
              <TextField
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF' }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                LOGIN
              </Button>
              <Box sx={{ width: '100%', mb: 2 }}>
                <div style={googleButtonStyle}>
                  <GoogleLogin
                    onSuccess={onGoogleLoginSuccess}
                    onError={() => console.log('Google login failed')}
                  />
                </div>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGuest}
                sx={{ mb: 2, backgroundColor: '#FFFFFF' }}
              >
                Play as a Guest
              </Button>
            </form>
          </CardContent>
        </Card>
        {networkError && (
          <Snackbar
            open={Boolean(networkError)}
            autoHideDuration={6000}
            onClose={() => setNetworkError('')}
            message={networkError}
          />
        )}
        {serverError && (
          <Snackbar
            open={Boolean(serverError)}
            autoHideDuration={6000}
            onClose={() => setServerError('')}
            message={serverError}
          />
        )}
        {genericError && (
          <Snackbar
            open={Boolean(genericError)}
            autoHideDuration={6000}
            onClose={() => setGenericError('')}
            message={genericError}
          />
        )}
        {emailError && (
          <Snackbar
            open={Boolean(emailError)}
            autoHideDuration={6000}
            onClose={() => setEmailError('')}
            message={emailError}
          />
        )}
      </Container>
    </Box>
  );
}

export default LandingPage;