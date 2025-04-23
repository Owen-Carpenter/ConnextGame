import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAINGEN_DIR = path.join(__dirname, '../chaingen');
const PROJECT_ROOT = path.join(__dirname, '../..');

const handleChaingen = {
    // Generate a word chain using the Python script
    generateWordChain: async (req, res) => {
        try {
            console.log("Received word chain generation request:", req.body);
            const { length = 10, gameType = 'classic' } = req.body;
            
            // Determine which input file to use based on gameType
            // Use the project root path since linked_binomials.json is in the root directory
            const inputFile = path.join(PROJECT_ROOT, 'linked_binomials.json');
            
            // Log the input file path for debugging
            console.log(`Using binomials file: ${inputFile}`);
            const fileExists = fs.existsSync(inputFile);
            console.log(`File exists: ${fileExists}`);
            
            if (!fileExists) {
                console.error(`CRITICAL ERROR: Binomials file ${inputFile} does not exist!`);
                // Try to get stats on the parent directory
                try {
                    const parentDir = path.dirname(inputFile);
                    const parentStats = fs.statSync(parentDir);
                    console.log(`Parent directory exists: ${parentStats.isDirectory()}`);
                    console.log(`Parent directory contents: ${fs.readdirSync(parentDir).join(', ')}`);
                } catch (statErr) {
                    console.error(`Error checking parent directory: ${statErr.message}`);
                }
                
                return res.status(200).json({
                    message: "Binomials file not found",
                    wordChain: [],
                    success: false,
                    error: "Missing required data file"
                });
            }
            
            // Check file size to make sure it's not empty
            const fileStats = fs.statSync(inputFile);
            console.log(`Binomials file size: ${fileStats.size} bytes`);
            
            if (fileStats.size === 0) {
                console.error(`CRITICAL ERROR: Binomials file ${inputFile} is empty!`);
                return res.status(200).json({
                    message: "Binomials file is empty",
                    wordChain: [],
                    success: false,
                    error: "Empty data file"
                });
            }
            
            // Validate chain length (capped at 50 for safety)
            const chainLength = Math.min(Math.max(parseInt(length, 10) || 10, 5), 50);
            
            console.log(`Generating ${gameType} word chain of length ${chainLength}`);
            
            // Make sure the Python script exists
            const scriptPath = path.join(CHAINGEN_DIR, 'generatewordchain.py');
            console.log(`Using Python script: ${scriptPath}`);
            const scriptExists = fs.existsSync(scriptPath);
            console.log(`Script exists: ${scriptExists}`);
            
            if (!scriptExists) {
                console.error(`CRITICAL ERROR: Python script ${scriptPath} does not exist!`);
                return res.status(200).json({
                    message: "Word chain generator script not found",
                    wordChain: [],
                    success: false,
                    error: "Missing required script"
                });
            }
            
            // Spawn python process to generate word chain
            console.log(`Spawning Python process: python ${scriptPath} ${inputFile} ${chainLength}`);
            const pythonProcess = spawn('python', [
                scriptPath,
                inputFile,
                chainLength.toString()
            ]);
            
            let responseData = '';
            let errorData = '';
            
            pythonProcess.stdout.on('data', (data) => {
                responseData += data.toString();
                console.log(`Python stdout: ${data}`);
            });
            
            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
                console.error(`Python stderr: ${data}`);
            });
            
            pythonProcess.on('close', (code) => {
                console.log(`Python process exited with code ${code}`);
                
                if (code !== 0) {
                    console.error(`Python process exited with code ${code}`);
                    console.error(`Error data: ${errorData}`);
                    
                    // Always return 200 with empty chain and error info
                    return res.status(200).json({
                        message: "Error generating word chain",
                        wordChain: [],
                        error: errorData,
                        success: false
                    });
                }
                
                try {
                    console.log(`Python output length: ${responseData.length} chars`);
                    console.log(`Python output: ${responseData.substring(0, 200)}...`);
                    
                    if (!responseData || responseData.trim() === '') {
                        console.error("Python script returned empty output");
                        return res.status(200).json({
                            message: "Python script returned empty output",
                            wordChain: [],
                            error: "Empty output from generator",
                            success: false
                        });
                    }
                    
                    const wordChain = JSON.parse(responseData);
                    
                    // Make absolutely sure we're not returning an empty array
                    if (!wordChain || !Array.isArray(wordChain) || wordChain.length === 0) {
                        console.error("Python script returned an empty chain - this shouldn't happen with our improved generator");
                        return res.status(200).json({
                            message: "Python script returned an empty chain",
                            wordChain: [], 
                            error: "Empty chain generated despite using improved generator",
                            success: false
                        });
                    }
                    
                    console.log(`Successfully generated word chain with ${wordChain.length} pairs`);
                    return res.status(200).json({
                        message: "Word chain generated successfully",
                        wordChain,
                        success: true
                    });
                } catch (parseError) {
                    console.error("Error parsing Python output:", parseError);
                    console.error("Python output:", responseData);
                    
                    // Always return 200 with empty chain and error info
                    return res.status(200).json({
                        message: "Error parsing word chain output",
                        wordChain: [],
                        error: parseError.message,
                        rawOutput: responseData.substring(0, 500),
                        success: false
                    });
                }
            });
        } catch (err) {
            console.error("Error generating word chain:", err);
            return res.status(200).json({
                message: "Error generating word chain",
                details: err.message,
                wordChain: [],
                success: false
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
                    
                    return res.status(200).json({
                        message: "Error generating binomials",
                        error: errorData,
                        success: false
                    });
                }
                
                return res.status(200).json({
                    message: "Binomials generated successfully",
                    success: true
                });
            });
        } catch (err) {
            console.error("Error generating binomials:", err);
            return res.status(200).json({
                message: "Error generating binomials",
                details: err.message,
                success: false
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
                    
                    return res.status(200).json({
                        message: "Error pruning unlinked binomials",
                        error: errorData,
                        success: false
                    });
                }
                
                return res.status(200).json({
                    message: "Unlinked binomials pruned successfully",
                    success: true
                });
            });
        } catch (err) {
            console.error("Error pruning unlinked binomials:", err);
            return res.status(200).json({
                message: "Error pruning unlinked binomials",
                details: err.message,
                success: false
            });
        }
    },
    
    // Get the raw binomials file content for debugging
    getBinomialsFile: async (req, res) => {
        try {
            const fs = require('fs');
            const binomialsFile = path.join(PROJECT_ROOT, 'linked_binomials.json');
            
            console.log(`Reading binomials file: ${binomialsFile}`);
            
            if (!fs.existsSync(binomialsFile)) {
                return res.status(404).json({
                    message: "Binomials file not found",
                    path: binomialsFile,
                    success: false
                });
            }
            
            const fileContent = fs.readFileSync(binomialsFile, 'utf8');
            let parsedContent;
            
            try {
                parsedContent = JSON.parse(fileContent);
                return res.status(200).json({
                    message: "Binomials file content",
                    binomials: parsedContent,
                    count: parsedContent.length,
                    success: true
                });
            } catch (parseError) {
                return res.status(200).json({
                    message: "Error parsing binomials file",
                    rawContent: fileContent.substring(0, 1000) + "...", // Send first 1000 chars to avoid huge responses
                    error: parseError.message,
                    success: false
                });
            }
        } catch (err) {
            console.error("Error reading binomials file:", err);
            return res.status(500).json({
                message: "Error reading binomials file",
                details: err.message,
                success: false
            });
        }
    }
};

export default handleChaingen; 