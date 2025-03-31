import React, { useEffect, useState } from 'react';

function GameType({ title }: { title: string }) {  
    const [streak, setStreak] = useState(0);
    const [topScore, setTopScore] = useState(0);
    let backgroundClass = "";

    // Load streak/score from localStorage on mount
    useEffect(() => {
      if (title.toLowerCase() === "classic") {
        const savedStreak = localStorage.getItem("classicStreak");
        if (savedStreak) {
          setStreak(parseInt(savedStreak, 10));
        }
      } else if (title.toLowerCase() === "infinite") {
        const savedTopScore = localStorage.getItem("infiniteTopScore");
        if (savedTopScore) {
          setTopScore(parseInt(savedTopScore, 10));
        }
      }
    }, [title]);

    switch(title.toLowerCase()){
      case "classic":
        backgroundClass = "classic-bg";
        break;
      case "infinite":
        backgroundClass = "infinite-bg";
        break;
      case "versus":
        backgroundClass = "versus-bg";
        break;
      default:
        backgroundClass = "default-bg";
    }

    return (
      <div className={`game-select-card ${backgroundClass}`}>
        <h1 className="card-title">{title}</h1>
        {title.toLowerCase() === "classic" && streak > 0 && (
          <div className="card-streak">
            <span>Win Streak: {streak}</span>
          </div>
        )}
        {title.toLowerCase() === "infinite" && topScore > 0 && (
          <div className="card-streak">
            <span>Best Score: {topScore}</span>
          </div>
        )}
      </div>
    );
}

export default GameType
