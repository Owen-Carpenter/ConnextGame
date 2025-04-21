import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import registerRoutes from './routes/register.js';
import authRoutes from './routes/auth.js';
import logoutRoutes from './routes/logout.js'
import paymentRoutes from './routes/payment.js';
import gameRoutes from './routes/game.js';
import chainRoutes from './routes/chain.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const URI = process.env.MONGODB_URI;
if(!URI){
    throw new Error("MONGODB_URI is not defined in the environment variable");
}

const PORT = process.env.PORT || 8080;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

mongoose.connect(URI);

const app = express();
app.use(express.json());
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the Client/dist directory
app.use(express.static(path.join(__dirname, '../Client/dist')));

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
app.use('/chain', chainRoutes);

// Test routes
app.post('/test', (req, res) => {
  console.log("Test POST route hit:", req.body);
  res.status(200).json({ message: "Test route working" });
});

app.get('/test', (req, res) => {
  console.log("Test GET route hit for ping");
  res.status(200).json({ message: "Server is running", timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, '../Client/dist')}`);
    console.log(`CORS configured for: ${CLIENT_URL}`);
})