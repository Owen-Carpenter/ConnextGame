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
  ["bee", "honey"],
  ["honey", "sweet"],
  ["sweet", "cake"],
  ["cake", "party"],
  ["party", "friend"],
  ["friend", "trust"]
];

export function InfiniteGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(1); // Start from the second word
  const [wordList, setWordList] = useState<string[][]>(fallbackWordList);
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState("");
  const [score, setScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0); // State variable to keep track of the streak
  const [countAnimation, setCountAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  // Fetch word chain from the server when component mounts
  useEffect(() => {
    const fetchWordChain = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'infinite',
          length: 20 // Start with more words for infinite mode
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

  // Function to fetch more words when nearing the end of the list
  const fetchMoreWords = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
        gameType: 'infinite',
        length: 10 // Fetch 10 more words
      });
      
      if (response.data && response.data.wordChain) {
        // Skip the first word in the new chain (which is a "start" word)
        // and append the rest to the current word list
        const newWords = response.data.wordChain.slice(1);
        setWordList(prevList => [...prevList, ...newWords]);
      } else {
        console.error("Invalid response format from chaingen API when fetching more words");
      }
    } catch (error) {
      console.error("Error fetching more words:", error);
    }
  };

  // Check if we need to fetch more words
  useEffect(() => {
    if (wordList.length - currentWordIndex < 5 && !loading) {
      fetchMoreWords();
    }
  }, [currentWordIndex, wordList.length, loading]);

  const resetGame = () => {
    // Fetch a new word chain from the server
    const fetchNewWordChain = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/chaingen/generate`, {
          gameType: 'infinite',
          length: 20 // Start with more words for infinite mode
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
    setCurrentWordIndex(1);
    setScore(0);
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
            
            // First try the test route to see if basic communication works
            try {
              console.log("Testing server connection with test route...");
              const testResponse = await axios.post(`${API_BASE_URL}/test`, 
                { 
                  test: true,
                  username: username
                }
              );
              console.log("Test route response:", testResponse.data);
            } catch (testError) {
              console.error("Test route failed:", testError);
            }
            
            // Then try the actual route
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
    const userGuess = inputValue;
    // Get the full target word from the word list
    const currentWord = wordList[currentWordIndex][0];
    
    if (userGuess === currentWord) {
      // Increase score based on word length
      const wordScore = currentWord.length * 10;
      setScore(prevScore => prevScore + wordScore);
      
      // Move to the next word
      setCurrentWordIndex(prevIndex => prevIndex + 1);
      
      // Set hint for the next word
      if (currentWordIndex + 1 < wordList.length) {
        const nextHint = wordList[currentWordIndex + 1][0].charAt(0);
        setInputValue(nextHint);
        setHint(nextHint);
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives === 0) {
        setGameOver(true);
        // Game over logic
        updateTopScore(score).then(newTopScore => {
          navigate('/GameStats', { 
            state: { 
              gameMode: 'Infinite', 
              score: score,
              wordsCompleted: currentWordIndex,
              topScore: newTopScore
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
      handleGuess();
    }
  };

  const currentWord = wordList[currentWordIndex][0];
  const blanks = "_".repeat(currentWord.length - inputValue.length);

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
                  <span className="completed-word">{wordList[index][0]}</span>
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