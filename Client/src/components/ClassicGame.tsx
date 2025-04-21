import "../styles/Classic.css";
import hiddenWord from "../assets/Hidden_Word.png";
import fiveLives from "../assets/Five_Lives.png";
import fourLives from "../assets/Four_Lives.png";
import threeLives from "../assets/Three_Lives.png";
import twoLives from "../assets/Two_Lives.png";
import oneLife from "../assets/One_Life.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config';

const livesImages = [fiveLives, fourLives, threeLives, twoLives, oneLife];

// Fallback word list in case API fails
const fallbackWordList = [
  ["start", "dog"],
  ["dog", "house"],
  ["house", "key"],
  ["key", "chain"],
  ["chain", "fence"],
  ["fence", "yard"],
  ["yard", "garden"],
  ["garden", "flower"],
  ["flower", "bee"],
  ["bee", "honey"]
];

export function ClassicGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordList, setWordList] = useState<string[][]>(fallbackWordList);
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState("");
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch word chain from the server when component mounts
  useEffect(() => {
    const fetchWordChain = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'classic',
          length: 10
        });
        
        if (response.data && response.data.wordChain) {
          setWordList(response.data.wordChain);
          // Get the first character of the second word as the hint
          if (response.data.wordChain[1] && response.data.wordChain[1][0]) {
            const initialHint = response.data.wordChain[1][0].charAt(0);
            setInputValue(initialHint);
            setHint(initialHint);
          }
        } else {
          console.error("Invalid response format from chaingen API");
          setWordList(fallbackWordList);
          // Get the first character of the second word as the hint
          const initialHint = fallbackWordList[1][0].charAt(0);
          setInputValue(initialHint);
          setHint(initialHint);
        }
      } catch (error) {
        console.error("Error fetching word chain:", error);
        setWordList(fallbackWordList);
        // Get the first character of the second word as the hint
        const initialHint = fallbackWordList[1][0].charAt(0);
        setInputValue(initialHint);
        setHint(initialHint);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWordChain();
  }, []);

  // Load streak from localStorage on component mount and fetch from server if logged in
  useEffect(() => {
    // First load from localStorage as a fallback
    const savedStreak = localStorage.getItem("classicStreak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
    
    // Then try to get the updated value from the server
    const fetchUserStreak = async () => {
      const token = localStorage.getItem("userToken");
      if (token) {
        try {
          // Try to get user info from server
          const response = await axios.get(`${API_BASE_URL}/game/user`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data && response.data.username) {
            // Get the user's current streak from the server
            try {
              const leaderboardResponse = await axios.get(`${API_BASE_URL}/game/leaderboard/classic`);
              const userEntry = leaderboardResponse.data.leaderboard.find(
                (entry: { username: string, games?: { classic?: { streak?: number } } }) => 
                  entry.username === response.data.username
              );
              
              if (userEntry && userEntry.games?.classic?.streak) {
                const serverStreak = userEntry.games.classic.streak;
                console.log("Got user's current streak from server:", serverStreak);
                setStreak(serverStreak);
                localStorage.setItem("classicStreak", serverStreak.toString());
              }
            } catch (leaderboardError) {
              console.error("Error fetching leaderboard:", leaderboardError);
            }
          }
        } catch (error) {
          console.error("Error getting user info:", error);
        }
      }
    };
    
    fetchUserStreak();
    
    // Check token and user info on component mount
    checkUserInfo();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  useEffect(() => {
    // Set up a listener to detect logout
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userToken" && !e.newValue) {
        // User logged out, reset streak in local storage
        localStorage.setItem("classicStreak", "0");
        setStreak(0);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const resetGame = () => {
    // Fetch a new word chain from the server
    const fetchNewWordChain = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'classic',
          length: 10
        });
        
        if (response.data && response.data.wordChain) {
          setWordList(response.data.wordChain);
          // Get the first character of the second word as the hint
          if (response.data.wordChain[1] && response.data.wordChain[1][0]) {
            const initialHint = response.data.wordChain[1][0].charAt(0);
            setInputValue(initialHint);
            setHint(initialHint);
          }
        } else {
          console.error("Invalid response format from chaingen API");
          setWordList(fallbackWordList);
          // Get the first character of the second word as the hint
          const initialHint = fallbackWordList[1][0].charAt(0);
          setInputValue(initialHint);
          setHint(initialHint);
        }
      } catch (error) {
        console.error("Error fetching word chain:", error);
        setWordList(fallbackWordList);
        // Get the first character of the second word as the hint
        const initialHint = fallbackWordList[1][0].charAt(0);
        setInputValue(initialHint);
        setHint(initialHint);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewWordChain();
    setCurrentWordIndex(0);
    setLives(5);
    setGameOver(false);
  };

  const updateStreak = async (isWin: boolean) => {
    try {
      if (isWin) {
        // Increment streak on win
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("classicStreak", newStreak.toString());
        
        // Dispatch a storage event to update all components listening for localStorage changes
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'classicStreak',
          newValue: newStreak.toString(),
          oldValue: streak.toString(),
          storageArea: localStorage
        }));
        
        // Update streak on server if user is logged in
        const token = localStorage.getItem("userToken");
        if (token) {
          try {
            // First try to get username from server
            let username;
            try {
              const userResponse = await axios.get(`${API_BASE_URL}/game/user`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (userResponse.data && userResponse.data.username) {
                username = userResponse.data.username;
                console.log("Got username from server:", username);
              }
            } catch (userError) {
              console.error("Error getting username from server:", userError);
            }
            
            // If we couldn't get the username from the server, try to decode the token
            if (!username) {
              try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                  const payload = JSON.parse(atob(tokenParts[1]));
                  username = payload.username;
                  console.log("Decoded username from token:", username);
                }
              } catch (decodeError) {
                console.error("Error decoding token:", decodeError);
              }
            }
            
            // If we have a username, send the streak update
            if (username) {
              console.log("Sending streak update with username:", username);
              
              const response = await axios.post(`${API_BASE_URL}/game/classic/streak`, 
                { 
                  username: username,
                  streak: newStreak 
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
              console.log("Streak update response:", response.data);
            } else {
              console.error("Could not determine username, cannot update streak");
            }
          } catch (error) {
            console.error("Error updating streak:", error);
          }
        } else {
          console.log("No auth token found, streak only saved locally");
        }
        
        return newStreak;
      } else {
        // Reset streak on loss
        localStorage.setItem("classicStreak", "0");
        setStreak(0);
        return 0;
      }
    } catch (error) {
      console.error("Error updating streak:", error);
      // Still return the correct streak value even if API call fails
      return isWin ? streak + 1 : 0;
    }
  };

  const handleGuess = () => {
    const userGuess = inputValue;
    // Get the full target word from the word list
    const currentWord = wordList[currentWordIndex + 1][0];
    
    if (userGuess === currentWord) {
      if (currentWordIndex < wordList.length - 2) {
        setCurrentWordIndex(currentWordIndex + 1);
        // Get the first character of the next word as the hint
        const nextHint = wordList[currentWordIndex + 2][0].charAt(0);
        setInputValue(nextHint); 
        setHint(nextHint);
      } else {
        setGameOver(true);
        // Update streak on win
        updateStreak(true).then(newStreak => {
          // Calculate score based on remaining lives and words completed
          const score = (currentWordIndex + 1) * 100 + lives * 50;
          resetGame();
          navigate('/GameStats', { 
            state: { 
              gameMode: 'Classic',
              score: score,
              wordsCompleted: currentWordIndex + 1,
              livesRemaining: lives,
              streak: newStreak
            } 
          });
        });
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
        // Reset streak on loss
        updateStreak(false).then(newStreak => {
          // Calculate score based on words completed
          const score = currentWordIndex * 100;
          resetGame();
          navigate('/GameStats', { 
            state: { 
              gameMode: 'Classic', 
              score: score,
              wordsCompleted: currentWordIndex,
              livesRemaining: 0,
              streak: newStreak
            } 
          });
        });
      } else {
        // Give more of the current word as a hint
        if (currentWord && hint.length < currentWord.length) {
          const nextHintLength = hint.length + 1;
          const newHint = currentWord.substring(0, nextHintLength);
          setHint(newHint);
          setInputValue(newHint);
        }
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

  // Function to check user info from token for debugging
  const checkUserInfo = async () => {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        // Try to get user info from server
        const response = await axios.get(`${API_BASE_URL}/game/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("User info from token:", response.data);
      } catch (error) {
        console.error("Error getting user info:", error);
        
        // Try to manually decode the token for debugging
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Manually decoded token payload:", payload);
          }
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
        }
      }
    } else {
      console.log("No user token found, user is not logged in");
    }
  };

  return (
    <>
      <div className="classic">
        <section className="classic-container">
          {loading ? (
            <div className="loading">Loading word chain...</div>
          ) : (
            <>
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

              <div className="streak-counter">
                <span>Streak: {streak}</span>
              </div>

              <button className="submit-btn" onClick={handleGuess} style={{ visibility: gameOver ? 'hidden' : 'visible' }}>Submit</button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
