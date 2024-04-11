import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import config from './config';
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import SignupPage from "./components/SignupPage";
import RoomPage from "./components/RoomPage";
import PublicRooms from "./components/PublicRooms";
import ProfilePage from './components/ProfilePage';
import CrosswordGrid from "./components/Crossword";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isGuest, isAuthCheckComplete } = useAuth();

  if (!isAuthCheckComplete) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !isGuest) {
    sessionStorage.setItem('lastLocation', window.location.pathname);
    return <Navigate to="/" />;
  }
  return children;
};

// Component for handling navigation
const NavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthCheckComplete } = useAuth();

  useEffect(() => {
    if (isAuthCheckComplete) {
      // If the user is authenticated and the current path is the landing page, redirect to '/home'.
      if (isAuthenticated && location.pathname === '/') {
        navigate('/home');
      } 
      // If the user is authenticated and the current path is '/home', redirect to '/home'.
      else if (isAuthenticated && location.pathname === '/home') {
        navigate('/home');
      }
      // If the user is authenticated and the current path is a room, redirect to that room.
      else if (isAuthenticated && location.pathname.startsWith('/room/')) {
        navigate(location.pathname);
      }
      else {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAuthCheckComplete, navigate, location.pathname]);

  return null;
};

function App() {
  // Router wrapper component to provide useLocation access
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  return (
    <GoogleOAuthProvider clientId={config.CLIENT_ID}>
      <AuthProvider location={location}>
        <NavigationHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path = "/crossword" element={<CrosswordGrid />} />
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
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;