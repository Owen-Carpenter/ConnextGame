import "../styles/Infinite.css";
//import hiddenWord from "../assets/Hidden_Word.png";
import fiveLives from "../assets/Five_Lives.png";
import fourLives from "../assets/Four_Lives.png";
import threeLives from "../assets/Three_Lives.png";
import twoLives from "../assets/Two_Lives.png";
import oneLife from "../assets/One_Life.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config';
import useWordChain from '../hooks/useWordChain';
  
const livesImages = [fiveLives, fourLives, threeLives, twoLives, oneLife];

// Fallback word list in case API fails
const fallbackWordList = ["dog", "house", "key", "chain", "fence", "yard", "garden", "flower", "bee", "honey"];

export function InfiniteGame() {
  // Use word chain hook to fetch words from the API
  const { wordChain, loading, error, refresh, isReady } = useWordChain('infinite');
  
  const [currentWordIndex, setCurrentWordIndex] = useState(1); // Start from the second word
  const [inputValue, setInputValue] = useState(''); // Will be set when word chain loads
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState(''); // Will be set when word chain loads
  const [streak, setStreak] = useState(0); // State variable to keep track of the streak
  const [topScore, setTopScore] = useState(0); // Track the top score
  const [countAnimation, setCountAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Transformed word list from the chain API
  const [wordList, setWordList] = useState<string[]>(fallbackWordList);

  // Update word list when the word chain is loaded
  useEffect(() => {
    if (isReady && wordChain.length > 0) {
      // Transform the word pairs into a flat list of words
      // Each pair in wordChain is [word1, word2]
      const words: string[] = [];
      wordChain.forEach(([word1, word2]: [string, string], index: number) => {
        if (index === 0) {
          words.push(word1);
        }
        words.push(word2);
      });
      
      // Update the word list
      setWordList(words);
      
      // Set initial hint and input value
      if (words.length > 1) {
        const initialHint = words[1][0];
        setHint(initialHint);
        setInputValue(initialHint);
      }
    }
  }, [wordChain, isReady]);

  // Load top score from localStorage on component mount
  useEffect(() => {
    // First load from localStorage as a fallback
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

  useEffect(() => {
    console.log("Current streak value:", streak);
  }, [streak]);

  const resetGame = () => {
    setCurrentWordIndex(1); // Reset to the second word
    // Reset the hint and inputValue based on the current word list
    if (wordList.length > 1) {
      setInputValue(wordList[1][0]);
      setHint(wordList[1][0]);
    }
    setLives(5);
    setGameOver(false);
    setStreak(0); // Reset the streak
    // Get a new set of words
    refresh();
  };
  
  // Function to check user info from token for debugging
  const checkUserInfo = async () => {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        // Check if token is expired based on its payload
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Token payload:", payload);
            
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              console.log("Token is expired, removing from localStorage");
              localStorage.removeItem("userToken");
              return;
            }
            
            // If we have a username in the token, we can use it directly
            if (payload.username) {
              console.log("Using username from token payload:", payload.username);
              return payload.username;
            }
          }
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
        }
        
        // If we're still here, try getting user info from server
        const response = await axios.get(`${API_BASE_URL}/game/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("User info from token:", response.data);
        return response.data.username;
      } catch (error) {
        console.error("Error getting user info:", error);
        
        // If we get a 401 or 403, the token is invalid or expired
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          console.warn("Authentication token is invalid or expired, removing it");
          localStorage.removeItem("userToken");
        }
        
        return null;
      }
    } else {
      console.log("No user token found, user is not logged in");
      return null;
    }
  };
  
  // Update top score on the server when the game ends
  const updateTopScore = async (score: number) => {
    try {
      // Calculate the new top score
      const newTopScore = Math.max(topScore, score);
      
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
          // Get username using our improved function
          const username = await checkUserInfo();
          
          // If we have a username, send the top score update
          if (username) {
            console.log("Sending infinite top score update with username:", username);
            
            // Send the actual score update
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
            } catch (error) {
              console.error("Error updating score:", error);
              
              // Type guard to check if this is an Axios error
              if (axios.isAxiosError(error)) {
                if (error.response) {
                  console.error("Response data:", error.response.data);
                  console.error("Response status:", error.response.status);
                } else if (error.request) {
                  console.error("Request made but no response received");
                } else {
                  console.error("Error setting up request:", error.message);
                }
              } else {
                console.error("Unexpected error:", error);
              }
            }
          } else {
            console.error("Could not determine username, cannot update top score");
          }
        } catch (error) {
          console.error("Error updating top score:", error);
        }
      } else {
        console.log("No auth token found, top score only saved locally");
      }
      
      return newTopScore;
    } catch (error) {
      console.error("Error updating top score:", error);
      return Math.max(topScore, score);
    }
  };

  const handleGuess = () => {
    // Use modulo to cycle through the word list for infinite mode
    const currentWord = wordList[currentWordIndex % wordList.length];
    const userGuess = inputValue.toLowerCase(); // Use the entire input value

    if (userGuess === currentWord) {
      setCurrentWordIndex(currentWordIndex + 1);
      const nextHint = wordList[(currentWordIndex + 1) % wordList.length][0];
      setInputValue(nextHint); // Set input value to the next hint
      setHint(nextHint); // Update hint to next word's first letter
      setStreak(streak + 1); // Increment the streak
      
      // Trigger animation
      setCountAnimation(true);
      setTimeout(() => setCountAnimation(false), 500); // Reset animation after 500ms
      
      // If we've gone through almost all the words, refresh the chain
      if (currentWordIndex % wordList.length === wordList.length - 2) {
        refresh();
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
        // Calculate score based on streak
        const score = streak * 100;
        
        // Update top score and then navigate to game stats
        updateTopScore(streak).then(newTopScore => {
          resetGame();
          navigate('/GameStats', { 
            state: { 
              gameMode: 'Infinite', 
              score: score,
              wordsCompleted: streak,
              livesRemaining: 0,
              topScore: newTopScore
            } 
          });
        });
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

  // Get current word and blanks only if the word list is loaded
  const currentWord = wordList[currentWordIndex % wordList.length] || '';
  const blanks = currentWord ? "_".repeat(currentWord.length - inputValue.length) : '';

  // Show loading state while fetching the word chain
  if (loading) {
    return (
      <div className="infinite">
        <section className="infinite-container">
          <h2>Loading word chain...</h2>
        </section>
      </div>
    );
  }

  // Show error state if the API call failed
  if (error) {
    return (
      <div className="infinite">
        <section className="infinite-container">
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(255, 235, 235, 0.5)', 
            borderRadius: '10px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginBottom: '10px', color: '#d32f2f' }}>Notice</h2>
            <p style={{ marginBottom: '15px' }}>{error}</p>
            <p style={{ marginBottom: '15px' }}>Game will continue with default word list.</p>
            <button 
              className="submit-btn" 
              onClick={refresh} 
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="infinite">
        <section className="infinite-container">
          <img className="health-banner" src={livesImages[5 - lives]} alt={`Lives ${lives}`} />

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

          {/* Word count display with inline styles for visibility */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(57, 231, 95, 0.2)',
              padding: '8px 15px',
              borderRadius: '20px',
              margin: '15px auto',
              fontWeight: 'bold',
              border: '2px solid #39e75f',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              position: 'relative',
            }}
          >
            <span style={{ marginRight: '8px', fontFamily: 'Indie Flower, sans-serif', fontSize: '20px', color: '#333' }}>
              Words Connected:
            </span>
            <span 
              style={{ 
                fontFamily: 'Indie Flower, sans-serif', 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#39e75f',
                ...(countAnimation ? { animation: 'countPulse 0.5s ease-in-out' } : {})
              }}
            >
              {streak}
            </span>
            {topScore > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginLeft: '15px', 
                paddingLeft: '15px', 
                borderLeft: '2px solid rgba(57, 231, 95, 0.3)' 
              }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontFamily: 'Indie Flower, sans-serif', 
                  color: '#333', 
                  marginRight: '5px', 
                  fontSize: '18px' 
                }}>
                  Best:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontFamily: 'Indie Flower, sans-serif', 
                  color: '#f4862b', 
                  fontSize: '22px' 
                }}>
                  {topScore}
                </span>
              </div>
            )}
          </div>

          <button className="submit-btn" onClick={handleGuess} style={{ visibility: gameOver ? 'hidden' : 'visible' }}>Submit</button>
        </section>
      </div>
    </>
  );
}