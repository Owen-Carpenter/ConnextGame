import { generateWordChain } from './wordChainWrapper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize word chains and create static JSON files for fallback
 */
export async function initializeChains() {
    console.log("Initializing word chain system...");
    
    try {
        // Check if linked_binomials.json exists
        const binomialsPath = path.join(__dirname, 'linked_binomials.json');
        if (!fs.existsSync(binomialsPath)) {
            console.warn("linked_binomials.json not found. Creating example file...");
            
            // Create a sample binomials file with basic pairs
            const exampleBinomials = [
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
            
            fs.writeFileSync(binomialsPath, JSON.stringify(exampleBinomials, null, 2));
            console.log("Created example binomials file");
        }
        
        // Generate classic chain
        console.log("Pre-generating classic word chain...");
        const classicChain = await generateWordChain('classic', true);
        console.log(`Generated classic chain with ${classicChain.length} pairs`);
        
        // Save to static file
        const classicPath = path.join(__dirname, 'static_classic_chain.json');
        fs.writeFileSync(classicPath, JSON.stringify(classicChain, null, 2));
        
        // Generate infinite chain
        console.log("Pre-generating infinite word chain...");
        const infiniteChain = await generateWordChain('infinite', true);
        console.log(`Generated infinite chain with ${infiniteChain.length} pairs`);
        
        // Save to static file
        const infinitePath = path.join(__dirname, 'static_infinite_chain.json');
        fs.writeFileSync(infinitePath, JSON.stringify(infiniteChain, null, 2));
        
        console.log("Word chain system initialized successfully!");
        return true;
    } catch (error) {
        console.error("Error initializing word chains:", error);
        return false;
    }
}

// If this file is run directly, initialize chains
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initializeChains().then(success => {
        if (success) {
            console.log("Word chain initialization complete!");
        } else {
            console.error("Word chain initialization failed!");
            process.exit(1);
        }
    });
} 