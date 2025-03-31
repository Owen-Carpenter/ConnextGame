import mongoose, {model} from "mongoose";

//Basic User Doc
const authenticationSchema = new mongoose.Schema({
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
    games: {
        classic: {
            topScore: { type: Number, default: 0 },
            streak: { type: Number, default: 0 }
        },
        infinite: {
            topScore: { type: Number, default: 0 },
            streak: { type: Number, default: 0 }
        },
        versus: {
            topScore: { type: Number, default: 0 },
            streak: { type: Number, default: 0 }
        }
    },
    role: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },
    transactions: [
        {
            rate: {
                type: String,
                enum: ["Monthly", "Yearly", "Lifetime"],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const AuthenticationModel = mongoose.model("Player", authenticationSchema);
export default AuthenticationModel;