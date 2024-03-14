import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(10),
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
  // Local state for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // TODO: Implement sign up logic
  };

  return (
    <Container maxWidth="xs">
      <StyledCard elevation={3}>
        <CardContent>
          <Title variant="h4" align="center">
            Sign Up
          </Title>
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
          <SubmitButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignUp}
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
        </CardContent>
      </StyledCard>
    </Container>
  );
}

export default SignupPage;
