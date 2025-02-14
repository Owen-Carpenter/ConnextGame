import React from 'react';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Paywall } from './pages/Paywall';
import { Leaderboard } from './pages/Leaderboard';
import { Classic } from './pages/Classic';
import { Infinite } from './pages/Infinite';
import { Versus } from './pages/Versus';
//import { GamePage } from "./pages/Game";
import './Styles/General.css';

import { HashRouter as Router, Route, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Subscribe" element={<Paywall/>}/>
          <Route path="/Classic" element={<Classic/>}/>
          <Route path="/Infinite" element={<Infinite/>}/>
          <Route path="/Versus" element={<Versus/>}/>
          <Route path="/Leaderboard" element={<Leaderboard/>}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;