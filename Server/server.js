import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import registerRoutes from './routes/register.js';
import authRoutes from './routes/auth.js';
import logoutRoutes from './routes/logout.js'
import paymentRoutes from './routes/payment.js';
import gameRoutes from './routes/game.js';
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
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    
    // Log request body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body:', JSON.stringify(req.body));
    }
    
    // Add response logging
    const originalSend = res.send;
    res.send = function(body) {
        console.log(`Response status: ${res.statusCode}`);
        return originalSend.call(this, body);
    };
    
    next();
});

app.use('/auth', authRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);
app.use('/payment', paymentRoutes);
app.use('/game', gameRoutes);

// Test route
app.post('/test', (req, res) => {
  console.log("Test route hit:", req.body);
  res.status(200).json({ message: "Test route working" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})