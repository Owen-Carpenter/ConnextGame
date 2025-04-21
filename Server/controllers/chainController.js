import { generateWordChain } from '../chaingen/wordChainWrapper.js';

const handleChainGeneration = {
    /**
     * Get a word chain for classic game mode
     */
    getClassicChain: async (req, res) => {
        try {
            const forceRefresh = req.query.refresh === 'true';
            const wordChain = await generateWordChain('classic', forceRefresh);
            
            return res.status(200).json({
                success: true,
                gameType: 'classic',
                wordChain
            });
        } catch (err) {
            console.error("Error generating classic word chain:", err);
            return res.status(500).json({ 
                success: false,
                message: "Error generating word chain",
                details: err.message
            });
        }
    },
    
    /**
     * Get a word chain for infinite game mode
     */
    getInfiniteChain: async (req, res) => {
        try {
            const forceRefresh = req.query.refresh === 'true';
            const wordChain = await generateWordChain('infinite', forceRefresh);
            
            return res.status(200).json({
                success: true,
                gameType: 'infinite',
                wordChain
            });
        } catch (err) {
            console.error("Error generating infinite word chain:", err);
            return res.status(500).json({ 
                success: false,
                message: "Error generating word chain",
                details: err.message
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
            
            const wordChain = await generateWordChain(gameType, forceRefresh);
            
            return res.status(200).json({
                success: true,
                gameType,
                wordChain
            });
        } catch (err) {
            console.error(`Error generating ${req.params.gameType} word chain:`, err);
            return res.status(500).json({ 
                success: false,
                message: "Error generating word chain",
                details: err.message
            });
        }
    }
};

export default handleChainGeneration; 