import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Link, TextField, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

function LandingPage() {
  const { login, guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/login', { email, password });
      login(response.data.token, response.data.userId);
      navigate('/home');
    } catch (error) {
      console.error('Login Error:', error.response?.data?.message || error.message);
    }
  };

  // Still need to get Google OAuth working

  const onGoogleLoginSuccess = async tokenResponse => {
    try {
      const googleUser = await axios.post('/googleLogin', { token: tokenResponse.access_token });
      login(googleUser.data.token, googleUser.data.userId); // Pass token and userId to login
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

  return (
    <Container component="main" maxWidth="xs" sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      justifyContent: 'center', 
      alignItems: 'center',
      overflow: 'auto'
    }}>
      <Card sx={{ p: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" fontFamily="'Bubblegum Sans', cursive">
            Welcome to Puzzle Party
          </Typography>
          <Typography variant="body2">
            Don't have an account yet? <Link onClick={handleSignUp} sx={{ cursor: 'pointer' }}>Sign Up</Link>
          </Typography>
          <TextField
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
            sx={{ mt: 3 }}
          />
          <TextField
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ mt: 3, mb: 2 }}
          >
            LOGIN
          </Button>
          <GoogleLogin
            onSuccess={onGoogleLoginSuccess}
            onError={() => console.log('Google login failed')}
          />
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGuest}
            sx={{ mb: 2 }}
          >
            Play as a Guest
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default LandingPage;