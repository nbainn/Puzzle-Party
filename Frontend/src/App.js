import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './AuthContext';
import { useAuth } from "./hooks/useAuth";
import { GoogleOAuthProvider } from '@react-oauth/google';
import config from './config';
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import SignupPage from "./components/SignupPage";
import RoomPage from "./components/RoomPage";
import PublicRooms from "./components/PublicRooms";
import ProfilePage from './components/ProfilePage';
import LoadingScreen from './components/LoadingScreen';
import Statistics from "./components/Statistics";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const theme = createTheme({
  typography: {
    fontFamily: "C&C Red Alert [INET]", // Use the browser's default font family
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading, isAblyReady } = useAuth();

  if (isLoading) {
    // Still loading the auth status
    return <LoadingScreen message="Loading, please wait..." />;
  } else if (!isAuthenticated && !isGuest) {
    // Not authenticated and not a guest, redirect to '/'
    return <Navigate to="/" />;
  } else if (!isAblyReady) {
    // Authenticated or guest, but Ably is not ready
    return <LoadingScreen message="Waiting for Ably connection..." />;
  } else {
    // Everything is ready, render the children
    return children;
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
    <GoogleOAuthProvider clientId={config.CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Conditionally rendered routes using ProtectedRoute */}
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/room/:roomId" element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute>
                <PublicRooms />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/statistics/:userId" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;