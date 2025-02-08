import { NavLink } from "react-router-dom";
import '../styles/Home.css';
import logo from '../assets/Connext_Logo.png';
import buttonLayout from "../assets/b_layout.png";

export default function HomeComponent() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString(undefined, options);

  return (
    
    <div className="main">
      <link href="https://fonts.googleapis.com/css2?family=Chewy&display=swap" rel="stylesheet" />
      <h1>Connext</h1>
      <h2>Can you guess the connecting word?</h2>
      <h3>You get 5 chances to find the link between these 10 words!</h3>
      <div className="home_buttons">
        <div><button className="button1">No Ads</button></div>
        <div><button className="button2">Log In</button></div>
        <div><NavLink to="/game" className="navlink-button">Play</NavLink></div>
      </div>
      <div className="bottom">
        <p>{currentDate}</p>
        <p>Daily Puzzle No. 1</p>
        <p>Made by Carpenter Development</p>
      </div>
    </div>
  );
}