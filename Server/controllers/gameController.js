import AuthenticationModel from "../models/authentication.js";

const handleGame = {
    updateClassicStreak: async (req, res) => {
        try {
            console.log("Received streak update request:", req.body);
            // Get username from either the request body or from the token
            let { username, streak } = req.body;
            
            console.log("Extracted from request body:", { username, streak });
            console.log("Auth token user:", req.user);
            
            // If username is not provided in the body, get it from the token
            if (!username && req.user) {
                username = req.user;
                console.log("Using username from token:", username);
            }
            
            if (!username) {
                console.error("No username provided in request body or token");
                return res.status(400).json({ 
                    message: "Username is required",
                    details: "No username was provided in the request body and none could be extracted from the token"
                });
            }
            
            if (streak === undefined) {
                console.error("No streak value provided");
                return res.status(400).json({ 
                    message: "Streak is required",
                    details: "No streak value was provided in the request"
                });
            }
            
            console.log("Looking for user with username:", username);
            const user = await AuthenticationModel.findOne({ username });
            
            if (!user) {
                console.error(`User not found: ${username}`);
                return res.status(404).json({ 
                    message: "User not found",
                    details: `No user found with username: ${username}`
                });
            }
            
            console.log(`Current streak for ${username}: ${user.games.classic.streak}, new streak: ${streak}`);
            
            // Update streak only if the new streak is higher than the current one
            if (streak > user.games.classic.streak) {
                user.games.classic.streak = streak;
                await user.save();
                
                // Log success for debugging
                console.log(`Updated streak for ${username} to ${streak}`);
                
                return res.status(200).json({ 
                    message: "Streak updated successfully",
                    currentStreak: user.games.classic.streak
                });
            } else {
                console.log(`Streak ${streak} not higher than current streak ${user.games.classic.streak} for ${username}. No update needed.`);
                
                return res.status(200).json({ 
                    message: "No update needed - current streak is higher or equal",
                    currentStreak: user.games.classic.streak
                });
            }
        } catch (err) {
            console.error("Error updating streak:", err);
            return res.status(500).json({ 
                message: "Error updating streak",
                details: err.message
            });
        }
    },
    
    getLeaderboard: async (req, res) => {
        try {
            // Get top streaks, filtering out users with 0 streak
            const classicLeaderboard = await AuthenticationModel.find({
                "games.classic.streak": { $gt: 0 } // Only include streaks greater than 0
            })
                .sort({ "games.classic.streak": -1 })
                .limit(10)
                .select("username games.classic.streak");
                
            console.log("Sending leaderboard data:", classicLeaderboard);
                
            return res.status(200).json({ 
                leaderboard: classicLeaderboard
            });
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            return res.status(500).json({ message: "Error fetching leaderboard" });
        }
    },

    getUserInfo: async (req, res) => {
        try {
            // This endpoint is only accessible with a valid token
            // Return user information from the token
            return res.status(200).json({
                username: req.user,
                message: "User info retrieved successfully"
            });
        } catch (err) {
            console.error("Error getting user info:", err);
            return res.status(500).json({ 
                message: "Error retrieving user info",
                details: err.message
            });
        }
    },

    updateInfiniteScore: async (req, res) => {
        try {
            console.log("Received infinite score update request:", req.body);
            // Get username from either the request body or from the token
            let { username, score } = req.body;
            
            console.log("Extracted from request body:", { username, score });
            console.log("Auth token user:", req.user);
            
            // If username is not provided in the body, get it from the token
            if (!username && req.user) {
                username = req.user;
                console.log("Using username from token:", username);
            }
            
            if (!username) {
                console.error("No username provided in request body or token");
                return res.status(400).json({ 
                    message: "Username is required",
                    details: "No username was provided in the request body and none could be extracted from the token"
                });
            }
            
            if (score === undefined) {
                console.error("No score value provided");
                return res.status(400).json({ 
                    message: "Score is required",
                    details: "No score value was provided in the request"
                });
            }
            
            console.log("Looking for user with username:", username);
            const user = await AuthenticationModel.findOne({ username });
            
            if (!user) {
                console.error(`User not found: ${username}`);
                return res.status(404).json({ 
                    message: "User not found",
                    details: `No user found with username: ${username}`
                });
            }
            
            console.log(`Current top score for ${username}: ${user.games.infinite.topScore}, new score: ${score}`);
            
            // Update score only if the new score is higher than the current one
            if (score > user.games.infinite.topScore) {
                user.games.infinite.topScore = score;
                await user.save();
                
                // Log success for debugging
                console.log(`Updated top score for ${username} to ${score}`);
                
                return res.status(200).json({ 
                    message: "Top score updated successfully",
                    currentScore: user.games.infinite.topScore
                });
            } else {
                console.log(`Score ${score} not higher than current top score ${user.games.infinite.topScore} for ${username}. No update needed.`);
                
                return res.status(200).json({ 
                    message: "No update needed - current top score is higher or equal",
                    currentScore: user.games.infinite.topScore
                });
            }
        } catch (err) {
            console.error("Error updating infinite score:", err);
            return res.status(500).json({ 
                message: "Error updating infinite score",
                details: err.message
            });
        }
    },
    
    getInfiniteLeaderboard: async (req, res) => {
        try {
            // Get top scores, filtering out users with 0 score
            const infiniteLeaderboard = await AuthenticationModel.find({
                "games.infinite.topScore": { $gt: 0 } // Only include scores greater than 0
            })
                .sort({ "games.infinite.topScore": -1 })
                .limit(10)
                .select("username games.infinite.topScore");
                
            console.log("Sending infinite leaderboard data:", infiniteLeaderboard);
                
            return res.status(200).json({ 
                leaderboard: infiniteLeaderboard
            });
        } catch (err) {
            console.error("Error fetching infinite leaderboard:", err);
            return res.status(500).json({ 
                message: "Error fetching infinite leaderboard",
                details: err.message
            });
        }
    }
};

export default handleGame;
