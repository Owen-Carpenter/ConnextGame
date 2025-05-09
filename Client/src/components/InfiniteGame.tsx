import "../styles/Infinite.css";
//import hiddenWord from "../assets/Hidden_Word.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config';
import { HealthChain } from "./HealthChain";
import { HelpModal } from "./HelpModal";

export function InfiniteGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(1); // Start from the second word
  const [wordList, setWordList] = useState<string[][]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState("");
  const [topScore, setTopScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gainedLife, setGainedLife] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lifeChangeAnimation, setLifeChangeAnimation] = useState<"gain" | "lose" | null>(null);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRawChain] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load top score from localStorage on component mount
  useEffect(() => {
    const savedTopScore = localStorage.getItem("infiniteTopScore");
    if (savedTopScore) {
      setTopScore(parseInt(savedTopScore, 10));
    }
    
    // Then try to get the updated value from the server
    const fetchUserTopScore = async () => {
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
            // Get the user's current top score from the server
            try {
              const leaderboardResponse = await axios.get(`${API_BASE_URL}/game/leaderboard/infinite`);
              const userEntry = leaderboardResponse.data.leaderboard.find(
                (entry: { username: string, games?: { infinite?: { topScore?: number } } }) => 
                  entry.username === response.data.username
              );
              
              if (userEntry && userEntry.games?.infinite?.topScore) {
                const serverTopScore = userEntry.games.infinite.topScore;
                console.log("Got user's current top score from server:", serverTopScore);
                setTopScore(serverTopScore);
                localStorage.setItem("infiniteTopScore", serverTopScore.toString());
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
    
    fetchUserTopScore();
    
    // Check token and user info on component mount
    checkUserInfo();
  }, []);

  // Fetch word chain from the server when component mounts
  useEffect(() => {
    const fetchWordChain = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'infinite',
          length: 20 // Start with more words for infinite mode
        });
        
        // Always set the raw chain data for debugging
        setRawChain(JSON.stringify(response.data.wordChain || []));
        
        if (response.data && response.data.wordChain) {
          setWordList(response.data.wordChain);
          // Get the first character of the second word as the hint
          if (response.data.wordChain.length > 1 && response.data.wordChain[1] && response.data.wordChain[1][0]) {
            const initialHint = response.data.wordChain[1][0].charAt(0);
            setInputValue(initialHint);
            setHint(initialHint);
          } else {
            // Set empty values if no valid second word
            setInputValue("");
            setHint("");
          }
        } else {
          console.error("Invalid response format from chaingen API or empty word chain");
          setError("Unable to generate word chain. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching word chain:", error);
        setError("Error connecting to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWordChain();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);
  
  // Set up a listener to detect logout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userToken" && !e.newValue) {
        // User logged out, reset top score in local storage
        localStorage.setItem("infiniteTopScore", "0");
        setTopScore(0);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Function to fetch more words when nearing the end of the list
  const fetchMoreWords = async () => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
        gameType: 'infinite',
        length: 10 // Fetch 10 more words
      });
      
      // Always log the raw chain for debugging
      console.log("More words response:", JSON.stringify(response.data.wordChain || []));
      
      if (response.data && response.data.wordChain) {
        // Skip the first word in the new chain (which is a "start" word)
        // and append the rest to the current word list
        const newWords = response.data.wordChain.slice(1);
        setWordList(prevList => [...prevList, ...newWords]);
      } else {
        console.error("Invalid response format from chaingen API when fetching more words");
        setError("Unable to generate more words. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching more words:", error);
      setError("Error connecting to server. Please try again.");
    }
  };

  // Check if we need to fetch more words
  useEffect(() => {
    if (wordList.length > 0 && wordList.length - currentWordIndex < 5 && !loading) {
      fetchMoreWords();
    }
  }, [currentWordIndex, wordList.length, loading]);

  const resetGame = () => {
    // Fetch a new word chain from the server
    const fetchNewWordChain = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'infinite',
          length: 20 // Start with more words for infinite mode
        });
        
        // Always set the raw chain data for debugging
        setRawChain(JSON.stringify(response.data.wordChain || []));
        
        if (response.data && response.data.wordChain) {
          setWordList(response.data.wordChain);
          // Get the first character of the second word as the hint
          if (response.data.wordChain.length > 1 && response.data.wordChain[1] && response.data.wordChain[1][0]) {
            const initialHint = response.data.wordChain[1][0].charAt(0);
            setInputValue(initialHint);
            setHint(initialHint);
          } else {
            // Set empty values if no valid second word
            setInputValue("");
            setHint("");
          }
        } else {
          console.error("Invalid response format from chaingen API or empty word chain");
          setError("Unable to generate word chain. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching word chain:", error);
        setError("Error connecting to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewWordChain();
    setCurrentWordIndex(1); // Start from the second word for infinite mode
    setLives(5);
    setGameOver(false);
  };

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
  
  // Update top score on the server when the game ends
  const updateTopScore = async (wordsCompleted: number) => {
    try {
      // Calculate the new top score (now equal to words completed)
      const newTopScore = Math.max(topScore, wordsCompleted);
      
      // Update top score locally if the new score is higher
      if (newTopScore > topScore) {
        setTopScore(newTopScore);
        localStorage.setItem("infiniteTopScore", newTopScore.toString());
        
        // Dispatch a storage event to update all components listening for localStorage changes
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'infiniteTopScore',
          newValue: newTopScore.toString(),
          oldValue: topScore.toString(),
          storageArea: localStorage
        }));
      }
      
      // Update score on server if user is logged in
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
          
          // If we have a username, send the top score update
          if (username) {
            console.log("Sending infinite top score update with username:", username);
            
            const url = `${API_BASE_URL}/game/infinite/score`;
            console.log("Attempting to POST to URL:", url);
            
            try {
              const response = await axios.post(url, 
                { 
                  username: username,
                  score: newTopScore
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
              console.log("Top score update response:", response.data);
              
              // If server reports a higher score than our local value, update it
              if (response.data.currentScore > newTopScore) {
                setTopScore(response.data.currentScore);
                localStorage.setItem("infiniteTopScore", response.data.currentScore.toString());
                console.log("Updated local top score to match server value:", response.data.currentScore);
                return response.data.currentScore;
              }
            } catch (error) {
              console.error("Axios error details:", error);
              
              // Type guard to check if this is an Axios error
              if (axios.isAxiosError(error)) {
                if (error.response) {
                  console.error("Response data:", error.response.data);
                  console.error("Response status:", error.response.status);
                  console.error("Response headers:", error.response.headers);
                } else if (error.request) {
                  console.error("Request made but no response received:", error.request);
                } else {
                  console.error("Error setting up request:", error.message);
                }
              } else {
                console.error("Unexpected error:", error);
              }
              // Continue with local score update even if API fails
            }
          } else {
            console.error("Could not determine username, cannot update top score");
          }
        } catch (error) {
          console.error("Error updating top score:", error);
          // Continue with local score update even if API fails
        }
      } else {
        console.log("No auth token found, top score only saved locally");
      }
      
      return newTopScore;
    } catch (error) {
      console.error("Error updating top score:", error);
      return Math.max(topScore, wordsCompleted);
    }
  };

  // Function to create confetti elements
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleGuess = () => {
    // Check if we have a valid word list and current word
    if (!wordList || wordList.length <= currentWordIndex || !wordList[currentWordIndex] || !wordList[currentWordIndex][0]) {
      setError("No valid word to guess. Please restart the game.");
      return;
    }
    
    // Prevent multiple rapid submissions
    if (isProcessingGuess) return;
    setIsProcessingGuess(true);
    
    const userGuess = inputValue;
    // Get the full target word from the word list
    const currentWord = wordList[currentWordIndex][0];
    
    if (userGuess === currentWord) {
      // Show confetti animation
      createConfetti();
      
      // Give player a life back if they're not at max
      if (lives < 5) {
        setLives(prev => prev + 1);
        setGainedLife(true);
        setLifeChangeAnimation("gain");
        setTimeout(() => {
          setGainedLife(false);
          setLifeChangeAnimation(null);
        }, 1500);
      }
      
      // Move to the next word
      setCurrentWordIndex(prevIndex => prevIndex + 1);
      
      // Set hint for the next word
      if (currentWordIndex + 1 < wordList.length) {
        const nextHint = wordList[currentWordIndex + 1][0].charAt(0);
        setInputValue(nextHint);
        setHint(nextHint);
        setIsProcessingGuess(false); // Reset processing flag
      }
    } else {
      // Reduce lives by 1
      const newLives = lives - 1;
      setLives(newLives);
      setLifeChangeAnimation("lose");
      setTimeout(() => {
        setLifeChangeAnimation(null);
        setIsProcessingGuess(false); // Reset processing flag after animation
      }, 1500);
      
      if (newLives === 0) {
        setGameOver(true);
        // Game over logic
        updateTopScore(currentWordIndex - 1).then(newTopScore => {
          navigate('/GameStats', { 
            state: { 
              gameMode: 'Infinite', 
              score: currentWordIndex - 1,
              wordsCompleted: currentWordIndex - 1,
              bestWords: newTopScore
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
    if (newValue.startsWith(hint)) {
      setInputValue(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
      handleGuess();
    }
  };

  // Add null checks to prevent errors when wordList is empty
  const currentWord = wordList && wordList.length > currentWordIndex && wordList[currentWordIndex] ? 
    wordList[currentWordIndex][0] : "";
  
  // Space out underlines by adding spaces between them
  const blanks = currentWord ? Array(currentWord.length - inputValue.length).fill("_").join(" ") : "";

  // Function to render confetti pieces
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    const confettiPieces = [];
    const shapes = ['square', 'triangle', 'circle'];
    const colors = ['#39e75f', '#55ff55', '#90ee90', '#00cc44', '#00ff00'];
    
    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100 + '%';
      const size = Math.random() * 10 + 5 + 'px';
      const duration = Math.random() * 3 + 2 + 's';
      const delay = Math.random() * 0.5 + 's';
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confettiPieces.push(
        <div 
          key={i}
          className={`confetti ${shape}`}
          style={{
            left,
            width: size,
            height: size,
            backgroundColor: color,
            animation: `confetti-fall ${duration} linear ${delay} forwards`
          }}
        />
      );
    }
    
    return <div className="confetti-container">{confettiPieces}</div>;
  };

  return (
    <>
      <div className="infinite">
        {renderConfetti()}
        <HelpModal gameMode="Infinite" />
        <section className="infinite-container">
          {loading ? (
            <div className="loading">Loading word chain...</div>
          ) : (
            <>
              <HealthChain 
                lives={lives}
                maxLives={5} 
                gainLife={lifeChangeAnimation === "gain"}
                loseLife={lifeChangeAnimation === "lose"}
              />

              {error && (
                <div className="error-message">
                  {error}
                  <button onClick={resetGame}>Try Again</button>
                </div>
              )}

              

              {wordList.length > 0 ? (
                <div className="word-list">
                  {Array.from({ length: 4 }, (_, i) => currentWordIndex - 3 + i).map((index) => (
                    <div key={index} className="word-item">
                      {index < 0 || index <= currentWordIndex - 4 ? null : index === currentWordIndex ? (
                        <div className="input-container">
                          <form onSubmit={(e) => {
                            e.preventDefault(); // Prevent form submission
                            handleGuess();
                          }}>
                            <input
                              type="text"
                              value={inputValue}
                              onChange={handleInputChange}
                              onKeyPress={handleKeyPress}
                              placeholder={hint}
                              ref={inputRef}
                              maxLength={currentWord ? currentWord.length : 10}
                              autoComplete="off"
                              autoCorrect="off"
                              spellCheck="false"
                            />
                            <div className="blanks">{blanks}</div>
                            <input type="submit" style={{ display: 'none' }} />
                          </form>
                        </div>
                      ) : wordList[index] && wordList[index][0] ? (
                        <span className="completed-word">{wordList[index][0]}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-words-message">
                  <p>No word chain available. Generated an empty list.</p>
                  <button onClick={resetGame}>Try Again</button>
                </div>
              )}

              <div className="word-count-container">
                <div className="count-section">
                  <span className="count-label">Words Connected:</span>
                  <span className="count-value">{Math.max(0, currentWordIndex - 1)}</span>
                </div>
                
                {topScore > 0 && (
                  <div className="best-score-section">
                    <span className="best-label">Best Words:</span>
                    <span className="best-value">{topScore}</span>
                  </div>
                )}
                
                {gainedLife && <div className="life-gained-message">+1 Life!</div>}
              </div>

              <button className="submit-btn" onClick={handleGuess} style={{ visibility: gameOver || wordList.length === 0 ? 'hidden' : 'visible' }}>Submit</button>
              
              {gameOver && (
                <button className="reset-btn" onClick={resetGame}>Play Again</button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}