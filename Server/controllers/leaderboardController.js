import AuthenticationModel from "../models/authentication.js";

const handleLeaderboard = {
    leaderboardRefresh: async () => {
        try{
            const classicLeaderboard = AuthenticationModel.find({})
                .sort({ "games.classic.topScore": -1})
                .limit(10)
                .select("username games.classic.topScore");
            
            const infiniteLeaderboard = AuthenticationModel.find({})
                .sort({ "games.infinite.topScore": -1})
                .limit(10)
                .select("username games.infinite.topScore");

            const versusLeaderboard = AuthenticationModel.find({})
                .sort({ "games.versus.topScores": -1})
                .limit(10)
                .select("username games.versus.topScore");
            return{
                classic: classicLeaderboard,
                infinite: infiniteLeaderboard,
                versus: versusLeaderboard
            };
        } catch(err){
            console.log(err);
            throw(err);
        }
    }
}

export default handleLeaderboard;