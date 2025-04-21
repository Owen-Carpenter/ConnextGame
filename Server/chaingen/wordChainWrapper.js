import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default JSON file path for binomials
const BINOMIALS_PATH = path.join(__dirname, 'linked_binomials.json');

// Cache to reduce filesystem/Python calls
const wordChainCache = {
  classic: null,
  infinite: null,
  lastUpdated: {
    classic: 0,
    infinite: 0
  }
};

// Cache TTL in milliseconds (1 hour for classic, 15 minutes for infinite)
const CACHE_TTL = {
  classic: 60 * 60 * 1000,
  infinite: 15 * 60 * 1000
};

// Fallback word chains in case the Python generation fails
const FALLBACK_CHAINS = {
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
    ["friend", "trust"],
    ["trust", "bond"],
    ["bond", "link"],
    ["link", "chain"],
    ["chain", "lock"],
    ["lock", "key"],
    // Additional pairs for infinite mode
    ["key", "door"],
    ["door", "room"],
    ["room", "house"],
    ["house", "home"],
    ["home", "family"],
    ["family", "love"],
    ["love", "heart"],
    ["heart", "beat"],
    ["beat", "drum"],
    ["drum", "sound"]
  ]
};

// Environment check
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Generate a word chain for games by calling the Python script
 * 
 * @param {string} gameType - "classic" (10 pairs) or "infinite" (100 pairs)
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of word pairs
 */
export async function generateWordChain(gameType = 'classic', forceRefresh = false) {
  const chainLength = gameType === 'classic' ? 10 : 30; // Reduced size for infinite to be more reliable
  const now = Date.now();
  
  // Check if we have a cached version that's still valid
  if (
    !forceRefresh && 
    wordChainCache[gameType] &&
    (now - wordChainCache.lastUpdated[gameType]) < CACHE_TTL[gameType]
  ) {
    console.log(`Using cached ${gameType} word chain`);
    return wordChainCache[gameType];
  }
  
  // Use fallback if we're on production and binomials file doesn't exist
  if (!fs.existsSync(BINOMIALS_PATH)) {
    console.warn('Binomials file not found. Using fallback word chains.');
    return FALLBACK_CHAINS[gameType];
  }

  // Try to run the python script, but with a timeout and fallback
  return new Promise((resolve) => {
    // If fallbacks are already in cache, use them initially (to avoid delay)
    if (FALLBACK_CHAINS[gameType]) {
      wordChainCache[gameType] = FALLBACK_CHAINS[gameType];
      wordChainCache.lastUpdated[gameType] = Date.now();
    }
    
    // Command to run the Python script with parameters
    const pythonExecutable = isProduction ? 'python3' : 'python';
    const command = `${pythonExecutable} ${path.join(__dirname, 'generatewordchain.py')} ${BINOMIALS_PATH} ${chainLength}`;
    
    console.log(`Generating ${gameType} word chain with length ${chainLength}`);
    
    // For safety, set a timeout to ensure we always return
    const timeoutId = setTimeout(() => {
      console.warn(`Python script execution timed out for ${gameType} chain. Using fallback.`);
      resolve(FALLBACK_CHAINS[gameType]);
    }, 5000); // 5 second timeout
    
    try {
      exec(command, (error, stdout, stderr) => {
        clearTimeout(timeoutId); // Clear the timeout since we got a response
        
        if (error) {
          console.error(`Error generating word chain: ${error.message}`);
          if (stderr) {
            console.error(`Python stderr: ${stderr}`);
          }
          resolve(FALLBACK_CHAINS[gameType]);
          return;
        }
        
        if (stderr) {
          console.warn(`Warning from Python script: ${stderr}`);
        }
        
        try {
          // Parse the output as JSON
          const wordChain = JSON.parse(stdout.trim());
          
          // Validate the word chain format and length
          if (Array.isArray(wordChain) && wordChain.length > 0) {
            // Update cache
            wordChainCache[gameType] = wordChain;
            wordChainCache.lastUpdated[gameType] = Date.now();
            
            console.log(`Generated ${gameType} word chain with ${wordChain.length} pairs`);
            resolve(wordChain);
          } else {
            console.warn(`Invalid word chain format or empty chain. Using fallback.`);
            resolve(FALLBACK_CHAINS[gameType]);
          }
        } catch (e) {
          console.error(`Error parsing word chain output: ${e.message}`);
          console.error(`Raw output: ${stdout}`);
          resolve(FALLBACK_CHAINS[gameType]);
        }
      });
    } catch (execError) {
      // Handle any errors in the exec call itself
      clearTimeout(timeoutId);
      console.error(`Failed to execute Python script: ${execError.message}`);
      resolve(FALLBACK_CHAINS[gameType]);
    }
  });
} 