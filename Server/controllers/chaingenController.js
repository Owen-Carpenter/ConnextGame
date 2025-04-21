import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAINGEN_DIR = path.join(__dirname, '../chaingen');

const handleChaingen = {
    // Generate a word chain using the Python script
    generateWordChain: async (req, res) => {
        try {
            console.log("Received word chain generation request:", req.body);
            const { length = 10, gameType = 'classic' } = req.body;
            
            // Determine which input file to use based on gameType
            const inputFile = path.join(CHAINGEN_DIR, 'linked_binomials.json');
            
            // Validate chain length (capped at 50 for safety)
            const chainLength = Math.min(Math.max(parseInt(length, 10) || 10, 5), 50);
            
            console.log(`Generating ${gameType} word chain of length ${chainLength}`);
            
            // Spawn python process to generate word chain
            const pythonProcess = spawn('python', [
                path.join(CHAINGEN_DIR, 'generatewordchain.py'),
                inputFile,
                chainLength.toString()
            ]);
            
            let responseData = '';
            let errorData = '';
            
            pythonProcess.stdout.on('data', (data) => {
                responseData += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
                console.error(`Python stderr: ${data}`);
            });
            
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python process exited with code ${code}`);
                    console.error(`Error data: ${errorData}`);
                    
                    // Return fallback chain if Python script fails
                    return res.status(200).json({
                        message: "Using fallback word chain due to generation error",
                        wordChain: getFallbackChain(gameType, chainLength),
                        error: errorData
                    });
                }
                
                try {
                    const wordChain = JSON.parse(responseData);
                    return res.status(200).json({
                        message: "Word chain generated successfully",
                        wordChain
                    });
                } catch (parseError) {
                    console.error("Error parsing Python output:", parseError);
                    console.error("Python output:", responseData);
                    
                    // Return fallback chain if JSON parsing fails
                    return res.status(200).json({
                        message: "Using fallback word chain due to parsing error",
                        wordChain: getFallbackChain(gameType, chainLength),
                        error: parseError.message
                    });
                }
            });
        } catch (err) {
            console.error("Error generating word chain:", err);
            return res.status(500).json({
                message: "Error generating word chain",
                details: err.message,
                wordChain: getFallbackChain(req.body.gameType || 'classic', req.body.length || 10)
            });
        }
    },
    
    // Generate binomials using the Python script
    generateBinomials: async (req, res) => {
        try {
            console.log("Received binomials generation request");
            
            // Spawn python process to generate binomials
            const pythonProcess = spawn('python', [
                path.join(CHAINGEN_DIR, 'createbinomials.py')
            ]);
            
            let errorData = '';
            
            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
                console.error(`Python stderr: ${data}`);
            });
            
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python process exited with code ${code}`);
                    console.error(`Error data: ${errorData}`);
                    
                    return res.status(500).json({
                        message: "Error generating binomials",
                        error: errorData
                    });
                }
                
                return res.status(200).json({
                    message: "Binomials generated successfully"
                });
            });
        } catch (err) {
            console.error("Error generating binomials:", err);
            return res.status(500).json({
                message: "Error generating binomials",
                details: err.message
            });
        }
    },
    
    // Prune unlinked binomials using the Python script
    pruneUnlinkedBinomials: async (req, res) => {
        try {
            console.log("Received prune unlinked binomials request");
            
            // Spawn python process to prune unlinked binomials
            const pythonProcess = spawn('python', [
                path.join(CHAINGEN_DIR, 'pruneunlinked.py')
            ]);
            
            let errorData = '';
            
            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
                console.error(`Python stderr: ${data}`);
            });
            
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python process exited with code ${code}`);
                    console.error(`Error data: ${errorData}`);
                    
                    return res.status(500).json({
                        message: "Error pruning unlinked binomials",
                        error: errorData
                    });
                }
                
                return res.status(200).json({
                    message: "Unlinked binomials pruned successfully"
                });
            });
        } catch (err) {
            console.error("Error pruning unlinked binomials:", err);
            return res.status(500).json({
                message: "Error pruning unlinked binomials",
                details: err.message
            });
        }
    }
};

// Helper function to get fallback word chains
function getFallbackChain(gameType, length) {
    const FALLBACK_CHAINS = {
        "classic": [
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
        "infinite": [
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
    
    const type = gameType.toLowerCase() === 'infinite' ? 'infinite' : 'classic';
    return FALLBACK_CHAINS[type].slice(0, Math.min(length, FALLBACK_CHAINS[type].length));
}

export default handleChaingen; 