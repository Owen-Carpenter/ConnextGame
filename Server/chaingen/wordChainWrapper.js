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

/**
 * Generate a word chain for games by calling the Python script
 * 
 * @param {string} gameType - "classic" (10 pairs) or "infinite" (100 pairs)
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} - Array of word pairs
 */
export async function generateWordChain(gameType = 'classic', forceRefresh = false) {
  const chainLength = gameType === 'classic' ? 10 : 100;
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
  
  // Check if binomials file exists
  if (!fs.existsSync(BINOMIALS_PATH)) {
    throw new Error('Binomials file not found. Run createbinomials.py and pruneunlinked.py first.');
  }

  return new Promise((resolve, reject) => {
    // Command to run the Python script with parameters
    const command = `python ${path.join(__dirname, 'generatewordchain.py')} ${BINOMIALS_PATH} ${chainLength}`;
    
    console.log(`Generating ${gameType} word chain with length ${chainLength}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating word chain: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`Warning from Python script: ${stderr}`);
      }
      
      try {
        // Parse the output as JSON
        const wordChain = JSON.parse(stdout.trim());
        
        // Update cache
        wordChainCache[gameType] = wordChain;
        wordChainCache.lastUpdated[gameType] = Date.now();
        
        console.log(`Generated ${gameType} word chain with ${wordChain.length} pairs`);
        resolve(wordChain);
      } catch (e) {
        console.error(`Error parsing word chain output: ${e.message}`);
        console.error(`Raw output: ${stdout}`);
        reject(e);
      }
    });
  });
} 