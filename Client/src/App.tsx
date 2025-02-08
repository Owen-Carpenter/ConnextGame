import React from 'react';
import { HomePage } from "./pages/Home";
import { GamePage } from "./pages/Game";
// import { About } from "./pages/About";
// import { Services } from "./pages/Services";
// import { Contact } from "./pages/Contact";
// import { Gallery } from "./pages/Gallery";
import './Styles/General.css';

import { HashRouter as Router, Route, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Game" element={<GamePage />} />
          {/* <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Services" element={<Services />} />
          <Route path="/Gallery" element={<Gallery />} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;