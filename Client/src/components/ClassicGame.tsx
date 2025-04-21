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
import useWordChain from '../hooks/useWordChain';

const livesImages = [fiveLives, fourLives, threeLives, twoLives, oneLife];

// Fallback word list in case API fails
const fallbackWordList = ["dog", "house", "key", "chain", "fence", "yard", "garden", "flower", "bee", "honey"];

export function ClassicGame() {
  // Use word chain hook to fetch words from the API
  const { wordChain, loading, error, refresh, isReady } = useWordChain('classic');
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState('');
  const [streak, setStreak] = useState(0);
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
    setCurrentWordIndex(0);
    // Reset the hint and inputValue based on the current word list
    if (wordList.length > 1) {
      setInputValue(wordList[1][0]);
      setHint(wordList[1][0]);
    }
    setLives(5);
    setGameOver(false);
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
            // Get username using our improved function
            const username = await checkUserInfo();
            
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

  // Get current word and blanks only if the word list is loaded
  const currentWord = wordList[currentWordIndex + 1] || '';
  const blanks = currentWord ? "_".repeat(currentWord.length - inputValue.length) : '';

  // Show loading state while fetching the word chain
  if (loading) {
    return (
      <div className="classic">
        <section className="classic-container">
          <h2>Loading word chain...</h2>
        </section>
      </div>
    );
  }

  // Show error state if the API call failed
  if (error) {
    return (
      <div className="classic">
        <section className="classic-container">
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
      <div className="classic">
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

          <div className="streak-counter">
            <span>Streak: {streak}</span>
          </div>

          <button className="submit-btn" onClick={handleGuess} style={{ visibility: gameOver ? 'hidden' : 'visible' }}>Submit</button>
        </section>
      </div>
    </>
  );
}
