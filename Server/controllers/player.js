import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    refreshToken: String,
})

const PlayerModel = mongoose.model("Player", playerSchema);
export default PlayerModel;