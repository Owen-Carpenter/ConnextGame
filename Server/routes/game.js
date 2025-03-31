import express from "express";
import handleGame from "../controllers/gameController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get user info from token (for debugging)
router.get('/user', verifyToken, handleGame.getUserInfo);

// Classic Game Routes
// Update user's classic streak (requires authentication)
router.post('/classic/streak', verifyToken, handleGame.updateClassicStreak);

// Get leaderboard for classic streaks
router.get('/leaderboard/classic', handleGame.getLeaderboard);

// Infinite Game Routes
// Update user's infinite top score (requires authentication)
console.log("Registering route: POST /game/infinite/score");
router.post('/infinite/score', verifyToken, handleGame.updateInfiniteScore);

// Alternative route with gameid in URL
console.log("Registering alternative route: POST /infinite/:gameid/score");
router.post('/infinite/:gameid/score', verifyToken, (req, res) => {
    console.log("Alternative route hit with gameid:", req.params.gameid);
    return handleGame.updateInfiniteScore(req, res);
});

// Get leaderboard for infinite top scores
router.get('/leaderboard/infinite', handleGame.getInfiniteLeaderboard);

export default router;
