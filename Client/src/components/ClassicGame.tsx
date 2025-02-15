import "../styles/Classic.css";
import hiddenWord from "../assets/Hidden_Word.png";
import fiveLives from "../assets/Five_Lives.png";
import fourLives from "../assets/Four_Lives.png";
import threeLives from "../assets/Three_Lives.png";
import twoLives from "../assets/Two_Lives.png";
import oneLife from "../assets/One_Life.png";
import { useState, useRef, useEffect } from "react";

const livesImages = [fiveLives, fourLives, threeLives, twoLives, oneLife];

const wordList = ["dog", "house", "key", "chain", "fence", "yard", "garden", "flower", "bee", "honey"];

export function ClassicGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState(wordList[1][0]); 
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState(wordList[1][0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  const resetGame = () => {
    setCurrentWordIndex(0);
    setInputValue(wordList[1][0]);
    setLives(5);
    setGameOver(false);
    setHint(wordList[1][0]);
  };

  const handleGuess = () => {
    const currentWord = wordList[currentWordIndex + 1];
    const userGuess = inputValue.toLowerCase(); 

    if (userGuess === currentWord) {
      if (currentWordIndex < wordList.length - 2) {
        setCurrentWordIndex(currentWordIndex + 1);
        const nextHint = wordList[currentWordIndex + 2][0];
        setInputValue(nextHint); 
        setHint(nextHint);
      } else {
        setGameOver(true);
        alert("Congratulations! You've completed the game.");
        resetGame();
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
        alert("Game Over! Try again.");
        resetGame();
      } else {
        const nextHintLength = hint.length + 1;
        const newHint = wordList[currentWordIndex + 1].slice(0, nextHintLength);
        setHint(newHint);
        setInputValue(newHint);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const currentWord = wordList[currentWordIndex + 1];
    if (newValue.startsWith(hint) && newValue.length <= currentWord.length) {
      setInputValue(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const currentWord = wordList[currentWordIndex + 1];
  const blanks = "_".repeat(currentWord.length - inputValue.length);

  return (
    <>
      <section className="classic-container">
        <img className="health-banner" src={livesImages[5 - lives]} alt={`Lives ${lives}`} />

        <div className="word-list">
          {wordList.map((word, index) => (
            <div key={index} className="word-item">
              {index === 0 || index <= currentWordIndex || gameOver ? (
                <span className="completed-word">{word}</span>
              ) : index === currentWordIndex + 1 && !gameOver ? (
                <>
                  <div className="input-container">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={hint}
                      ref={inputRef}
                      maxLength={currentWord.length} // Prevents exceeding word length
                    />
                    <div className="blanks">{blanks}</div>
                  </div>
                </>
              ) : (
                <img src={hiddenWord} alt="Hidden Word" className="hidden-word" />
              )}
            </div>
          ))}
        </div>

        <button className="submit-btn" onClick={handleGuess} style={{ visibility: gameOver ? 'hidden' : 'visible' }}>Submit</button>
      </section>
    </>
  );
}
