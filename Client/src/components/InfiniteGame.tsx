import "../styles/Infinite.css";
import hiddenWord from "../assets/Hidden_Word.png";
import fiveLives from "../assets/Five_Lives.png";
import fourLives from "../assets/Four_Lives.png";
import threeLives from "../assets/Three_Lives.png";
import twoLives from "../assets/Two_Lives.png";
import oneLife from "../assets/One_Life.png";
import { useState, useRef, useEffect } from "react";

const livesImages = [fiveLives, fourLives, threeLives, twoLives, oneLife];

const wordList = ["dog", "house", "key", "chain", "fence", "yard", "garden", "flower", "bee", "honey"];

export function InfiniteGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(1); // Start from the second word
  const [inputValue, setInputValue] = useState(wordList[1][0]); // Initial input value includes the hint for the second word
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState(wordList[1][0]); // Initial hint for the second word
  const [streak, setStreak] = useState(0); // State variable to keep track of the streak
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  const resetGame = () => {
    setCurrentWordIndex(1); // Reset to the second word
    setInputValue(wordList[1][0]);
    setLives(5);
    setGameOver(false);
    setHint(wordList[1][0]);
    setStreak(0); // Reset the streak
  };

  const handleGuess = () => {
    const currentWord = wordList[currentWordIndex % wordList.length];
    const userGuess = inputValue.toLowerCase(); // Use the entire input value

    if (userGuess === currentWord) {
      setCurrentWordIndex(currentWordIndex + 1);
      const nextHint = wordList[(currentWordIndex + 1) % wordList.length][0];
      setInputValue(nextHint); // Set input value to the next hint
      setHint(nextHint); // Update hint to next word’s first letter
      setStreak(streak + 1); // Increment the streak
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
        alert("Game Over! Try again.");
        resetGame();
      } else {
        // Reveal more letters in the hint
        const nextHintLength = hint.length + 1;
        const newHint = wordList[currentWordIndex % wordList.length].slice(0, nextHintLength);
        setHint(newHint);
        setInputValue(newHint); // Update input value to include the new hint
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.startsWith(hint)) {
      setInputValue(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const currentWord = wordList[currentWordIndex % wordList.length];
  const blanks = "_".repeat(currentWord.length - inputValue.length);

  return (
    <>
      <section className="infinite-container">
        <img src={livesImages[5 - lives]} alt={`Lives ${lives}`} />

        <div className="word-list">
          
          {Array.from({ length: 4 }, (_, i) => currentWordIndex - 3 + i).map((index) => (
            <div key={index} className="word-item">
              {index < 0 || index <= currentWordIndex - 4 ? null : index === currentWordIndex ? (
                <div className="input-container">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={hint}
                    ref={inputRef}
                    maxLength={currentWord.length} // Set the maxLength attribute
                  />
                  <div className="blanks">{blanks}</div>
                </div>
              ) : (
                <span className="completed-word">{wordList[index % wordList.length]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="streak-container">
          <span className="streak-label">Streak:</span>
          <span className="streak-count">{streak}</span>
        </div>

        <button onClick={handleGuess} style={{ visibility: gameOver ? 'hidden' : 'visible' }}>Submit</button>
      </section>
    </>
  );
}