import { NavLink } from "react-router-dom";
import '../styles/Home.css';
import logo from '../assets/Connext_Logo.png';

export default function HomeComponent() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString(undefined, options);

  return (
    <div className="main">
      <img src={logo} alt="Connext Logo" />
      <h1>Connext</h1> 
      <h2>Can you guess the connecting word?</h2>
      <h3>You get 5 chances to find the link between these 10 words!</h3>
      <div className="home_buttons">
        <button className="button1">No Ads</button>
        <button className="button2">Log In</button>
        <NavLink to="/game">
          <button className="button3">Play</button>
        </NavLink>
      </div>
      <p>{currentDate}</p>
      <p>Daily Puzzle No. 1</p>
      <p>Made by Carpenter Development</p>
    </div>
  );
}