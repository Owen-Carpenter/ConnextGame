import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Home.css";
import "../styles/Game.css";
import logo from "../assets/Connext_Logo.png";
import chain from "../assets/Chain_Image.png";
import hiddenWord from "../assets/Hidden_Word.png"; // Import the hidden word image
import fiveLives from "../assets/Five_Lives.png";
import fourLives from "../assets/Four_Lives.png";
import threeLives from "../assets/Three_Lives.png";
import twoLives from "../assets/Two_Lives.png";
import oneLife from "../assets/One_Life.png";
import howToPlay from "../assets/how_to_play.png"; // Import the how to play image
import ('https://fonts.googleapis.com/css2?family=Kirang+Haerang&display=swap');

export default function GameComponent() {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const currentDate = new Date().toLocaleDateString(undefined, options);

  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [hint, setHint] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState(""); // State to track the reason for game over
  const [shake, setShake] = useState(false); // State to manage shake animation
  const [highlight, setHighlight] = useState(false); // State to manage highlight animation
  const [move, setMove] = useState(false); // State to manage move animation
  const [moveDistance, setMoveDistance] = useState(0); // State to manage move distance
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const maxAttempts = 5;
  const inputRef = useRef(null);
  const wordRefs = useRef([]); // Array of refs for each word

  useEffect(() => {
    fetch('http://localhost:5000/api/wordSets/random')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched data:", data); // Debugging log
        if (data && data.words) {
          setWords(data.words);
          setHint(data.words[1][0]);
        } else {
          console.error("Invalid data format:", data); // Debugging log
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error); // Debugging log
      });
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex, attempts]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    if (input.startsWith(hint)) {
      setUserInput(input.slice(hint.length));
    } else {
      setUserInput(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver) return;

    if ((hint + userInput).toLowerCase() === words[currentWordIndex + 1].toLowerCase()) {
      setHighlight(true); // Trigger highlight animation
      if (currentWordIndex + 1 < words.length - 1) {
        const currentRect = inputRef.current.getBoundingClientRect();
        const nextRect = wordRefs.current[currentWordIndex + 1].getBoundingClientRect();
        const currentCenter = currentRect.top + currentRect.height / 2;
        const nextCenter = nextRect.top + nextRect.height / 2;
        const distance = nextCenter - currentCenter;
        setMoveDistance(distance); // Calculate the distance to move
        setMove(true); // Trigger move animation only if not the last word
      }
      setTimeout(() => {
        setHighlight(false);
        setMove(false);
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput("");
        setHint(words[currentWordIndex + 2] ? words[currentWordIndex + 2][0] : "");
        if (currentWordIndex + 1 === words.length - 1) {
          setGameOver(true);
          setGameOverReason("completed");
          setWords([]); // Clear the array of words
          console.log("Game Over! All words completed."); // Debugging log
        }
      }, 500); // Remove highlight and move animation after 500ms
    } else {
      setAttempts(attempts + 1);
      setUserInput(""); // Reset the user input while keeping the hint
      setShake(true); // Trigger shake animation
      setTimeout(() => setShake(false), 500); // Remove shake animation after 500ms
      if (attempts >= maxAttempts - 1) {
        setGameOver(true);
        setGameOverReason("attempts");
        setWords([]); // Clear the array of words
        console.log("Game Over! Maximum attempts reached."); // Debugging log
      } else {
        setHint(words[currentWordIndex + 1].slice(0, attempts + 2));
      }
    }
  };

  const renderLives = () => {
    const livesLeft = maxAttempts - attempts;
    let livesImage;
    switch (livesLeft) {
      case 5:
        livesImage = fiveLives;
        break;
      case 4:
        livesImage = fourLives;
        break;
      case 3:
        livesImage = threeLives;
        break;
      case 2:
        livesImage = twoLives;
        break;
      case 1:
        livesImage = oneLife;
        break;
      default:
        livesImage = oneLife; // Default to one life image if no lives left
    }
    return <img src={livesImage} alt={`${livesLeft} lives left`} className="lives-image" />;
  };

  const getBorderColor = (attempts) => {
    const maxAttempts = 5;
    const startColor = [249, 172, 95]; // Orange
    const endColor = [235, 113, 83]; // Red
    const ratio = attempts / maxAttempts;
    const color = startColor.map((start, index) => Math.round(start + ratio * (endColor[index] - start)));
    return `rgb(${color.join(",")})`;
  };

  const renderWord = (word, index) => {
    if (gameOver) {
      return <span className="completed">{word}</span>;
    } else if (index === 0) {
      return <span className="completed">{word}</span>;
    } else if (index <= currentWordIndex) {
      return <span className={`completed ${highlight ? 'highlight' : ''}`}>{word}</span>; // Add highlight class conditionally
    } else if (index === currentWordIndex + 1) {
      const blanks = "_".repeat(word.length - hint.length - userInput.length);
      const displayValue = hint + userInput;
      return (
        <span className="hint" ref={(el) => (wordRefs.current[index] = el)}>
          <input
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={blanks}
            style={{ color: getBorderColor(attempts), borderColor: getBorderColor(attempts), transition: 'transform 0.5s ease' }} // Apply dynamic transform with transition
            ref={inputRef}
            className={`word-input ${shake ? 'shake' : ''} ${highlight ? 'highlight' : ''} ${move && index !== words.length - 1 ? 'move' : ''}`} // Add shake, highlight, and move classes conditionally
            maxLength={word.length} // Limit the input length to the word length
          />
        </span>
      );
    } else {
      return (
        <span className="remaining" ref={(el) => (wordRefs.current[index] = el)}>
          <img
        className="hidden"
        src={hiddenWord}
        style={{ paddingTop: '5px' }} // Corrected padding style
        alt="Hidden Word"
          />
        </span>
      );
    }
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleHelpClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="main">
      <NavLink to="/">
        <h1>Connext</h1>
      </NavLink>
      <link href="https://fonts.googleapis.com/css2?family=Kirang+Haerang&display=swap" rel="stylesheet"/>
      <div className="lives">
        {renderLives()}
      </div>
      <button className="help-button" onClick={handleHelpClick}>?</button>
      <div className="game_board">
        {gameOver && (
          <div>
            {gameOverReason === "completed" ? (
              <p className="wonGame">Congratulations!<br/>You've completed all the words.</p>
            ) : (
              <p className="lostGame">Game Over!<br/>You've used all your attempts.</p>
            )}
            <button className="button3" onClick={handlePlayAgain}>Play Again</button>
          </div>
        )}
        <div className="word-list">
          {words.map((word, index) => (
            <p key={index} className={index === currentWordIndex ? "current" : ""}>
              {renderWord(word, index)}
            </p>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <button className="submit_button" type="submit" disabled={gameOver}>Submit</button>
        </form>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <img src={howToPlay} alt="How to Play" className="how-to-play-image" />
          </div>
        </div>
      )}
    </div>
  );
}