import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import SignupPage from "./components/SignupPage";
import RoomPage from "./components/RoomPage";
import PublicRooms from "./components/PublicRooms";
import CrosswordGrid from "./components/Crossword";
// import { useAuth } from "./hooks/useAuth";

function App() {
  // const { isAuthenticated } = useAuth(); // Comment out authentication check until able to implement

  // Dummy isAuthenticated variable to bypass auth checks
  const isAuthenticated = true;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/room/:roomId" element={isAuthenticated ? <RoomPage /> : <LandingPage />} />
        <Route path="/rooms" element={isAuthenticated ? <PublicRooms /> : <LandingPage />} />
        <Route path="/crossword" element={<CrosswordGrid />} />
      </Routes>
    </Router>
  );
}

export default App;