import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Link as MuiLink, Snackbar, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Title = styled(Typography)({
  fontFamily: "'Bubblegum Sans', cursive",
  marginBottom: '16px',
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
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [userColor, setUserColor] = useState('#FFFFFF');  // Default white

  const handleSignUp = async (event) => {
    event.preventDefault(); 
    setLoading(true);
    try {
      const response = await axios.post('/signup', { email, password, nickname, userColor });
      console.log('Signup response data:', response.data);
      setLoading(false);
      // Use the login function from useAuth to update the auth state and handle Ably initialization
      login(response.data.token, response.data.userId);
      navigate('/home');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to sign up.');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px',
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
              onChange={(e) => setUserColor(e.target.value)}
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
          </form>
          {error && (
            <Snackbar
              open={Boolean(error)}
              autoHideDuration={6000}
              onClose={() => setError('')}
              message={error}
            />
          )}
        </CardContent>
      </StyledCard>
    </Container>
  );
}

export default SignupPage;
