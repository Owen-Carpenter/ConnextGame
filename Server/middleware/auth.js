import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        console.log('=== Auth Middleware Debug ===');
        console.log('Request headers:', req.headers);
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('No authorization header found');
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.error('No token found in authorization header');
            return res.status(401).json({ message: 'No token provided' });
        }

        console.log('Token found, attempting to verify...');
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Token decoded successfully:', decoded);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return res.status(401).json({ message: 'Invalid token' });
    }
}; 