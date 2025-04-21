import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Define types for the hook return value
export interface WordChainHookResult {
  wordChain: Array<[string, string]>; // Array of word pairs
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isReady: boolean;
}

// Game type options
export type GameType = 'classic' | 'infinite';

// Fallback word chains in case the API fails
const FALLBACK_CHAINS: Record<GameType, Array<[string, string]>> = {
  classic: [
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
  ],
  infinite: [
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
  ]
};

/**
 * React hook to fetch and manage word chains for games
 * 
 * @param {GameType} gameType - 'classic' or 'infinite'
 * @returns {WordChainHookResult} - Word chain data and control functions
 */
export default function useWordChain(gameType: GameType = 'classic'): WordChainHookResult {
  const [wordChain, setWordChain] = useState<Array<[string, string]>>(FALLBACK_CHAINS[gameType]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  
  // Function to fetch the word chain
  const fetchWordChain = useCallback(async (refresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE_URL}/chain/${gameType}${refresh ? '?refresh=true' : ''}`;
      console.log(`Fetching word chain from: ${url}`);
      
      // First check if the Server is running with a quick ping
      try {
        await axios.get(`${API_BASE_URL}/test`, { timeout: 2000 });
      } catch (pingError) {
        console.warn("Server ping failed, likely not running locally:", pingError);
        console.log("Using fallback word chain and skipping API call");
        setWordChain(FALLBACK_CHAINS[gameType]);
        setUsedFallback(true);
        setError("Could not connect to word chain server. Using default word list.");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(url, { timeout: 5000 }); // Add timeout to prevent long waits
      
      if (response.data.success && response.data.wordChain && Array.isArray(response.data.wordChain)) {
        setWordChain(response.data.wordChain);
        setUsedFallback(false);
      } else {
        console.warn('Invalid response format from chain API:', response.data);
        if (!usedFallback) {
          console.log(`Using fallback word chain for ${gameType} mode`);
          setWordChain(FALLBACK_CHAINS[gameType]);
          setUsedFallback(true);
        }
        throw new Error(response.data.message || 'Invalid response from word chain API');
      }
    } catch (err) {
      console.error(`Error fetching ${gameType} word chain:`, err);
      
      // Use fallback word chains if we haven't already
      if (!usedFallback) {
        console.log(`Using fallback word chain for ${gameType} mode`);
        setWordChain(FALLBACK_CHAINS[gameType]);
        setUsedFallback(true);
        // We'll set a less severe error message since we're using fallbacks
        setError(`Could not connect to word chain server. Using default word list.`);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the word chain');
      }
    } finally {
      setLoading(false);
    }
  }, [gameType, usedFallback]);
  
  // Fetch word chain on component mount or gameType change
  useEffect(() => {
    fetchWordChain();
  }, [fetchWordChain]);
  
  return {
    wordChain,
    loading,
    error,
    refresh: () => fetchWordChain(true),
    isReady: true // Always true since we have fallbacks
  };
} 