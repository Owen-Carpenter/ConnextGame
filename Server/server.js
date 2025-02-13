import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import registerRoutes from './routes/register.js';
import authRoutes from './routes/auth.js';
import logoutRoutes from './routes/logout.js'
import cookieParser from 'cookie-parser';

dotenv.config();

const URI = process.env.MONGODB_URI;
if(!URI){
    throw new Error("MONGODB_URI is not defined in the environment variable");
}

const PORT = process.env.PORT || 8080;

mongoose.connect(URI);

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})