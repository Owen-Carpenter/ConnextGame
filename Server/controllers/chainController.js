import { generateWordChain } from '../chaingen/wordChainWrapper.js';

// Fallback word chains in case everything else fails
const EMERGENCY_FALLBACKS = {
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
        ["chain", "fence"]
    ]
};

const handleChainGeneration = {
    /**
     * Get a word chain for classic game mode
     */
    getClassicChain: async (req, res) => {
        try {
            console.log("Classic word chain requested");
            const forceRefresh = req.query.refresh === 'true';
            
            try {
                const wordChain = await generateWordChain('classic', forceRefresh);
                console.log(`Successfully generated classic word chain with ${wordChain.length} pairs`);
                
                return res.status(200).json({
                    success: true,
                    gameType: 'classic',
                    wordChain
                });
            } catch (generationError) {
                console.error("Error in word chain generation:", generationError);
                
                // Even if generation fails, we'll return a fallback chain
                return res.status(200).json({
                    success: true,
                    gameType: 'classic',
                    wordChain: EMERGENCY_FALLBACKS.classic,
                    note: "Using emergency fallback word chain due to generation error"
                });
            }
        } catch (err) {
            console.error("Unhandled error in classic word chain endpoint:", err);
            
            // Return a fallback chain in case of any error
            return res.status(200).json({
                success: true,
                gameType: 'classic',
                wordChain: EMERGENCY_FALLBACKS.classic,
                note: "Using emergency fallback word chain due to server error"
            });
        }
    },
    
    /**
     * Get a word chain for infinite game mode
     */
    getInfiniteChain: async (req, res) => {
        try {
            console.log("Infinite word chain requested");
            const forceRefresh = req.query.refresh === 'true';
            
            try {
                const wordChain = await generateWordChain('infinite', forceRefresh);
                console.log(`Successfully generated infinite word chain with ${wordChain.length} pairs`);
                
                return res.status(200).json({
                    success: true,
                    gameType: 'infinite',
                    wordChain
                });
            } catch (generationError) {
                console.error("Error in word chain generation:", generationError);
                
                // Even if generation fails, we'll return a fallback chain
                return res.status(200).json({
                    success: true,
                    gameType: 'infinite',
                    wordChain: EMERGENCY_FALLBACKS.infinite,
                    note: "Using emergency fallback word chain due to generation error"
                });
            }
        } catch (err) {
            console.error("Unhandled error in infinite word chain endpoint:", err);
            
            // Return a fallback chain in case of any error
            return res.status(200).json({
                success: true, 
                gameType: 'infinite',
                wordChain: EMERGENCY_FALLBACKS.infinite,
                note: "Using emergency fallback word chain due to server error"
            });
        }
    },
    
    /**
     * Get a new word chain for any game type
     */
    getWordChain: async (req, res) => {
        try {
            const { gameType = 'classic' } = req.params;
            const forceRefresh = req.query.refresh === 'true';
            
            if (!['classic', 'infinite'].includes(gameType)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid game type",
                    details: "Game type must be 'classic' or 'infinite'"
                });
            }
            
            console.log(`${gameType} word chain requested via generic endpoint`);
            
            try {
                const wordChain = await generateWordChain(gameType, forceRefresh);
                console.log(`Successfully generated ${gameType} word chain with ${wordChain.length} pairs`);
                
                return res.status(200).json({
                    success: true,
                    gameType,
                    wordChain
                });
            } catch (generationError) {
                console.error(`Error in ${gameType} word chain generation:`, generationError);
                
                // Even if generation fails, we'll return a fallback chain
                return res.status(200).json({
                    success: true,
                    gameType,
                    wordChain: EMERGENCY_FALLBACKS[gameType],
                    note: "Using emergency fallback word chain due to generation error"
                });
            }
        } catch (err) {
            console.error(`Error generating ${req.params.gameType} word chain:`, err);
            
            // Determine which fallback to use
            const gameType = (req.params.gameType && ['classic', 'infinite'].includes(req.params.gameType)) 
                ? req.params.gameType 
                : 'classic';
                
            // Return a fallback chain in case of any error
            return res.status(200).json({ 
                success: true,
                gameType,
                wordChain: EMERGENCY_FALLBACKS[gameType],
                note: "Using emergency fallback word chain due to server error"
            });
        }
    }
};

export default handleChainGeneration; 