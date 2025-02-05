import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';

dotenv.config();

// const URI = process.env.MONGODB_URI;
// if (!URI) {
//   throw new Error("MONGODB_URI is not defined in the environment variables");
// }

// mongoose.connect(URI);

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });