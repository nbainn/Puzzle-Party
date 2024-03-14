import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Link, TextField, Box, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

function LandingPage() {
  // State for traditional login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const authenticateUser = () => {
    // TODO: Common authentication tasks (like redirecting to HomePage)
    // This can be called after traditional login or Google OAuth success
    navigate('/home'); // For now, just navigate to the HomePage
  };

  // TODO: Implement the handleLogin function to:
  // 1. Validate the input fields (email and password).
  // 2. Send login request to the server with email and password.
  // 3. Handle the response from the server.
  //    - If successful, save the received token and user information in global state/local storage/session storage.
  //    - If error, display the error message to the user.
  // 4. Redirect the user to the HomePage upon successful login.
  const handleLogin = () => {
    console.log('Traditional Login with:', email, password);
    // TODO: Traditional login logic
    authenticateUser();
  };

  const googleLogin = useGoogleLogin({
    onSuccess: tokenResponse => {
      console.log('Google tokenResponse:', tokenResponse);
      // Handle the successful response here, like saving the token and redirecting to the home page
      navigate('/home');
    },
    onError: () => {
      console.log('Login failed');
      // Handle login failure here
    },
  });

  // TODO: Implement the handleGuest function to:
  // 1. Generate a temporary guest userID on the client or retrieve from the server.
  // 2. Save the guest userID in the global state/local storage to maintain session.
  // 3. Redirect the user to the HomePage as a guest.
  // 4. Consider limiting the functionality or persisting data for guests as per your application's requirements.
  const handleGuest = () => {
    navigate('/home'); // For now, just navigate to the HomePage
  };

  // TODO: Implement the handleSignUp function to:
  // 1. Redirect the user to a SignUp page/component.
  // 2. Provide a form for the user to enter account details, such as email, password, and possibly username.
  // 3. Validate user input and handle sign-up logic with appropriate feedback.
  // 4. On successful account creation, redirect to the login page or automatically log the user in.
  // 5. Handle any errors and provide feedback during the sign-up process.
  const handleSignUp = () => {
    navigate('/signup'); // For now, just navigate to the SignupPage
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Card sx={{ p: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" fontFamily="'Bubblegum Sans', cursive">
            Welcome to Puzzle Party
          </Typography>
          <Typography sx={{ mt: 2, mb: 1 }} color="textSecondary">
            Login
          </Typography>
          <Typography variant="body2">
            Don't have an account yet? <Link onClick={handleSignUp} sx={{ cursor: 'pointer' }}>Sign Up</Link>
          </Typography>
          <TextField
            value={email} // Bind state to the TextField
            onChange={(e) => setEmail(e.target.value)} // Update state on change
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
            value={password} // Bind state to the TextField
            onChange={(e) => setPassword(e.target.value)} // Update state on change
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
          <Typography variant="body2" sx={{ mb: 2 }}>
            or login with
          </Typography>
          <Button
            onClick={() => googleLogin()}
            startIcon={<GoogleIcon />}
          >
            Login with Google
          </Button>
          <Button
            fullWidth
            variant="text"
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
