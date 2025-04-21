import express from "express";
import handleChainGeneration from "../controllers/chainController.js";

const router = express.Router();

// Get word chain for classic game mode
router.get('/classic', handleChainGeneration.getClassicChain);

// Get word chain for infinite game mode
router.get('/infinite', handleChainGeneration.getInfiniteChain);

// Get word chain for any game type
router.get('/:gameType', handleChainGeneration.getWordChain);

export default router; 