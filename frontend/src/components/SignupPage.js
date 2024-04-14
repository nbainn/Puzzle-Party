import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Link as MuiLink, Snackbar, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Title = styled(Typography)({
  //fontFamily: "'Bubblegum Sans', cursive",
  marginBottom: '4px',
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [serverError, setServerError] = useState('');
  const [genericError, setGenericError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [userColor, setUserColor] = useState('#FFFFFF');
  const [invalidColorError, setInvalidColorError] = useState('');

  const isValidHexColor = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (!isValidHexColor(userColor)) {
      setInvalidColorError('Invalid hex color format.');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/signup', { email, password, nickname, userColor });
      login();
      navigate('/home');
    } catch (err) {
      setLoading(false);
      if (err.response) {
        if (err.response.status === 500) {
          setServerError('Something went wrong on our end. Please try again later.');
        } else {
          setGenericError(err.response?.data?.message || 'Failed to sign up.');
        }
      } else {
        setNetworkError('Unable to connect to the server. Please try again later.');
      }
    }
  };

  const handleColorChange = (color) => {
    if (isValidHexColor(color)) {
      setUserColor(color);
      setInvalidColorError('');
    } else {
      setInvalidColorError('Invalid color format');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4px',
      overflow: 'auto'
    }}>
      <StyledCard elevation={3}>
        <CardContent>
          <Title variant="h4" align="center">Sign Up</Title>
          <form onSubmit={handleSignUp}>
            <StyledTextField
              label="Email Address"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError !== ''}
              helperText={emailError}
            />
            <StyledTextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <StyledTextField
              label="Nickname (optional)"
              variant="outlined"
              fullWidth
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <StyledTextField
              label="Favorite Color"
              variant="outlined"
              fullWidth
              value={userColor}
              onChange={(e) => handleColorChange(e.target.value)}
              error={invalidColorError !== ''}
              helperText={invalidColorError}
              type="color"
            />
            <SubmitButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              Create Account
            </SubmitButton>
          </form>
          <Typography align="center">
            Already have an account?{' '}
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate('/')}
              underline="hover"
            >
              Login
            </MuiLink>
          </Typography>
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
          {invalidColorError && (
            <Snackbar
              open={Boolean(invalidColorError)}
              autoHideDuration={6000}
              onClose={() => setInvalidColorError('')}
              message={invalidColorError}
            />
          )}
        </CardContent>
      </StyledCard>
    </Container>
  );
}

export default SignupPage;