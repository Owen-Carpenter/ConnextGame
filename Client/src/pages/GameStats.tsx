import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameStats.css";
import "../styles/Background.css";
import Header from "../components/Header";

export function GameStats() {
  const location = useLocation();
  const navigate = useNavigate();
  const sceneRef = useRef<HTMLElement>(null);
  
  const gameData = location.state || { 
    gameMode: "Unknown", 
    score: 0, 
    wordsCompleted: 0,
    livesRemaining: 0,
    streak: 0
  };

  const handlePlayAgain = () => {
    navigate(`/${gameData.gameMode}`);
  };

  const handleBackToHome = () => {
    navigate("/Home");
  };

  const randomWords = [
    "Galaxy", "Nebula", "Star", "Cosmos", "Meteor", "Orbit", "Asteroid", 
    "Comet", "Planet", "Universe", "Blackhole", "Supernova", "Quasar", 
    "Lightyear", "Exoplanet", "Constellation", "Gravity", "Solar", "Rocket"
  ];

  const fontFamilies = [
    "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia", 
    "Comic Sans MS", "Tahoma", "Trebuchet MS", "Roboto", "Lobster"
  ];

  const fontSizes = [
    "10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px"
  ];

  useEffect(() => {
    const scene = sceneRef.current;

    if (scene) {
      const CreateDiv = () => {
        for (let i = 0; i < 150; i++) {
          const div = document.createElement("div");
          const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
          const randomFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
          const randomFontSize = fontSizes[Math.floor(Math.random() * fontSizes.length)];

          div.textContent = randomWord;
          div.style.fontFamily = randomFontFamily;
          div.style.fontSize = randomFontSize;

          scene.appendChild(div);
        }
      };
      CreateDiv();

      const stars = scene.querySelectorAll('div');
      stars.forEach(star => {
        const x = `${Math.random() * 200}vmax`;
        const y = `${Math.random() * 100}vh`;
        const z = `${Math.random() * 200 - 100}vmin`;
        const rx = `${Math.random() * 360}deg`;
        star.style.setProperty('--x', x);
        star.style.setProperty('--y', y);
        star.style.setProperty('--z', z);
        star.style.setProperty('--rx', rx);
        const delay = `${Math.random() * 1.5}s`;
        star.style.animationDelay = delay;
      });
    }
    return () => {
      if (scene) {
        scene.innerHTML = '';
      }
    };
  }, []);

  return (
    <>
      <main className="scene" ref={sceneRef}></main>
      <section className="game-stats">
        <div className="content-container">
          <Header />
          <div className="stats-container">
            <div className="stats-box">
              <h2>{gameData.gameMode} Game Over</h2>
              <ul>
                {gameData.gameMode === "Classic" ? (
                  <li>
                    <h3 className="stat-label">Win Streak:</h3>
                    <h3 className="stat-value">{gameData.streak}</h3>
                  </li>
                ) : gameData.gameMode === "Infinite" ? (
                  <li>
                    <h3 className="stat-label">Score:</h3>
                    <h3 className="stat-value">{gameData.wordsCompleted} Words</h3>
                  </li>
                ) : (
                  <li>
                    <h3 className="stat-label">Score:</h3>
                    <h3 className="stat-value">{gameData.score} pts</h3>
                  </li>
                )}
                {gameData.gameMode !== "Infinite" && (
                  <li>
                    <h3 className="stat-label">Words Completed:</h3>
                    <h3 className="stat-value">{gameData.wordsCompleted}</h3>
                  </li>
                )}
                {gameData.gameMode === "Classic" && (
                  <li>
                    <h3 className="stat-label">Lives Remaining:</h3>
                    <h3 className="stat-value">{gameData.livesRemaining}</h3>
                  </li>
                )}
                {gameData.gameMode === "Infinite" && gameData.topScore && (
                  <li>
                    <h3 className="stat-label">Best Record:</h3>
                    <h3 className="stat-value">{gameData.topScore} Words</h3>
                  </li>
                )}
                {gameData.gameMode === "Versus" && (
                  <li>
                    <h3 className="stat-label">Opponent Score:</h3>
                    <h3 className="stat-value">{Math.floor(gameData.score * 0.8)} pts</h3>
                  </li>
                )}
              </ul>
              <div className="game-over-buttons">
                <button className="play-again-btn" onClick={handlePlayAgain}>
                  Play Again
                </button>
                <button className="home-btn" onClick={handleBackToHome}>
                  Back to Home
                </button>
                <button className="leaderboard-btn" onClick={() => navigate('/Leaderboard')}>
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}