import "../styles/Classic.css";
import hiddenWord from "../assets/Hidden_Word.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config';
import { HealthChain } from "./HealthChain";
import { HelpModal } from "./HelpModal";

export function ClassicGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordList, setWordList] = useState<string[][]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState("");
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gainedLife, setGainedLife] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lifeChangeAnimation, setLifeChangeAnimation] = useState<"gain" | "lose" | null>(null);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRawChain] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch word chain from the server when component mounts
  useEffect(() => {
    const fetchWordChain = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Making API call to ${API_BASE_URL}/chaingen/generate with game type classic`);
        
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'classic',
          length: 10
        });
        
        console.log("API response received:", response.data);
        
        // Always set the raw chain data for debugging
        setRawChain(JSON.stringify(response.data.wordChain || []));
        
        if (response.data && response.data.wordChain) {
          if (response.data.wordChain.length === 0) {
            console.error("API returned an empty word chain");
            setError("Server returned an empty word chain. Please try again.");
            return;
          }
          
          console.log(`Word chain received with ${response.data.wordChain.length} pairs`);
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
          console.error("Invalid response format from chaingen API or empty word chain", response.data);
          setError("Unable to generate word chain. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching word chain:", error);
        
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            request: error.request ? 'Request made but no response' : 'Error setting up request',
          });
          
          // More detailed error message
          if (error.code === 'ECONNREFUSED') {
            setError("Cannot connect to server. Please check if the server is running.");
          } else if (error.response) {
            setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
          } else if (error.request) {
            setError("No response from server. Please check your connection.");
          } else {
            setError("Error connecting to server. Please try again.");
          }
        } else {
          setError("Error connecting to server. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchWordChain();
  }, []);

  // Load streak from localStorage on component mount and fetch from server if logged in
  useEffect(() => {
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
        setError(null);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'classic',
          length: 10
        });

        console.log(response.data);
        
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
              
              // If server reports a higher streak than our local value, update it
              if (response.data.currentStreak > newStreak) {
                setStreak(response.data.currentStreak);
                localStorage.setItem("classicStreak", response.data.currentStreak.toString());
                console.log("Updated local streak to match server value:", response.data.currentStreak);
              }
            } else {
              console.error("Could not determine username, cannot update streak");
            }
          } catch (error) {
            console.error("Error updating streak:", error);
            // Continue with local streak even if server update fails
          }
        } else {
          console.log("No auth token found, streak only saved locally");
        }
        
        return newStreak;
      } else {
        // Reset streak on loss
        localStorage.setItem("classicStreak", "0");
        setStreak(0);
        
        // Also update server to reset streak if user is logged in
        const token = localStorage.getItem("userToken");
        if (token) {
          try {
            const userResponse = await axios.get(`${API_BASE_URL}/game/user`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (userResponse.data && userResponse.data.username) {
              // Submit a streak of 0 to reset on the server
              await axios.post(`${API_BASE_URL}/game/classic/streak`, 
                { 
                  username: userResponse.data.username,
                  streak: 0
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
            }
          } catch (error) {
            console.error("Error resetting streak on server:", error);
          }
        }
        
        return 0;
      }
    } catch (error) {
      console.error("Error updating streak:", error);
      // Still return the correct streak value even if API call fails
      return isWin ? streak + 1 : 0;
    }
  };

  // Function to create confetti elements
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleGuess = () => {
    // Check if we have a current word to guess
    if (!wordList || wordList.length <= currentWordIndex + 1 || !wordList[currentWordIndex + 1] || !wordList[currentWordIndex + 1][0]) {
      setError("No valid word to guess. Please restart the game.");
      return;
    }
    
    // Prevent multiple rapid submissions
    if (isProcessingGuess) return;
    setIsProcessingGuess(true);
    
    const userGuess = inputValue;
    // Get the full target word from the word list
    const currentWord = wordList[currentWordIndex + 1][0];
    
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
      
      if (currentWordIndex < wordList.length - 2) {
        setCurrentWordIndex(currentWordIndex + 1);
        // Get the first character of the next word as the hint
        const nextHint = wordList[currentWordIndex + 2][0].charAt(0);
        setInputValue(nextHint); 
        setHint(nextHint);
        setIsProcessingGuess(false); // Reset processing flag
      } else {
        setGameOver(true);
        // Update streak on win
        updateStreak(true).then(newStreak => {
          // Calculate score based on remaining lives and words completed
          const score = (currentWordIndex + 1) * 100 + lives * 50;
          resetGame();
          setIsProcessingGuess(false); // Reset processing flag
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
      setLifeChangeAnimation("lose");
      setTimeout(() => {
        setLifeChangeAnimation(null);
        setIsProcessingGuess(false); // Reset processing flag after animation
      }, 1500);
      
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
    const currentWord = wordList[currentWordIndex + 1][0];
    if (newValue.startsWith(hint) && newValue.length <= currentWord.length) {
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
  const currentWord = wordList && wordList.length > currentWordIndex + 1 && wordList[currentWordIndex + 1] ? 
    wordList[currentWordIndex + 1][0] : "";
  
  // Space out underlines by adding spaces between them
  const blanks = currentWord ? Array(currentWord.length - inputValue.length).fill("_").join(" ") : "";

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
      <div className="classic">
        {renderConfetti()}
        <HelpModal gameMode="Classic" />
        <section className="classic-container">
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
                  {wordList.map((word, index) => (
                    <div key={index} className="word-item">
                      {index === 0 || index <= currentWordIndex || gameOver ? (
                        <span className="completed-word">{Array.isArray(word) && word[0] ? word[0] : word}</span>
                      ) : index === currentWordIndex + 1 && !gameOver ? (
                        <>
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
                        </>
                      ) : (
                        <img src={hiddenWord} alt="Hidden Word" className="hidden-word" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-words-message">
                  <p>No word chain available. Generated an empty list.</p>
                  <button onClick={resetGame}>Try Again</button>
                </div>
              )}

              <div className="streak-counter">
                <span>Streak: {streak}</span>
                {gainedLife && <span className="life-gained-message">+1 Life!</span>}
              </div>

              <button className="submit-btn" onClick={handleGuess} style={{ visibility: gameOver || wordList.length === 0 ? 'hidden' : 'visible' }}>Submit</button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
