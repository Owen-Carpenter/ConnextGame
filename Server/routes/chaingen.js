import express from "express";
import handleChaingen from "../controllers/chaingenController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Generate a word chain
// Public route - no authentication required
router.post('/generate', handleChaingen.generateWordChain);

// Get the raw binomials file for debugging
// Public route - no authentication required
router.get('/binomials-file', handleChaingen.getBinomialsFile);

// Generate binomials - admin only
router.post('/binomials', verifyToken, handleChaingen.generateBinomials);

// Prune unlinked binomials - admin only
router.post('/prune', verifyToken, handleChaingen.pruneUnlinkedBinomials);

export default router; 