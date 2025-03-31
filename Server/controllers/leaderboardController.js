import AuthenticationModel from "../models/authentication.js";

const handleLeaderboard = {
    leaderboardRefresh: async () => {
        try{
            const classicLeaderboard = await AuthenticationModel.find({})
                .sort({ "games.classic.streak": -1})
                .limit(10)
                .select("username games.classic.streak");
            
            const infiniteLeaderboard = await AuthenticationModel.find({})
                .sort({ "games.infinite.topScore": -1})
                .limit(10)
                .select("username games.infinite.topScore");

            const versusLeaderboard = await AuthenticationModel.find({})
                .sort({ "games.versus.topScore": -1})
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