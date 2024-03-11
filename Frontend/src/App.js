import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RoomPage from './components/RoomPage';
<<<<<<< HEAD
import PublicRooms from './components/PublicRooms';
=======
import CrosswordGrid from './components/Crossword';
>>>>>>> 427cf5c2ff44a5641db69a89c90e915520a0ec54

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
<<<<<<< HEAD
        <Route path="/rooms/" element={<PublicRooms />} />
=======
        <Route path = "/crossword" element = {<CrosswordGrid/>} />
>>>>>>> 427cf5c2ff44a5641db69a89c90e915520a0ec54
      </Routes>
    </Router>
  );
}

export default App;
