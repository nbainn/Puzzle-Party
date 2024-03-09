import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RoomPage from './components/RoomPage';
import CrosswordGrid from './components/Crossword';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path = "/crossword" element = {<CrosswordGrid />} />
      </Routes>
    </Router>
  );
}

export default App;
