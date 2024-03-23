import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './AuthContext';
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import SignupPage from "./components/SignupPage";
import RoomPage from "./components/RoomPage";
import PublicRooms from "./components/PublicRooms";
import ProfilePage from './components/ProfilePage';
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isGuest } = useAuth();
  if (!isAuthenticated && !isGuest) {
    // Redirect them to the / page if not authenticated
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
