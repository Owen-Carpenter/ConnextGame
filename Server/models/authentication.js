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
    }
});

const AuthenticationModel = mongoose.model("Player", authenticationSchema);
export default AuthenticationModel;