import AuthenticationModel from "../models/authentication.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const handleLogin = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // User/Pwd Not Found
            if (!username || !password) {
                return res.status(400).json({ 
                    'message': 'Username and password are required',
                    'status': 'error'
                });
            }

            // Find the user
            const foundUser = await AuthenticationModel.findOne({ username });
            if (!foundUser) {
                return res.status(401).json({ 
                    'message': 'Invalid username or password',
                    'status': 'error'
                });
            }

            // Check for match
            const userMatch = await bcrypt.compare(password, foundUser.password);
            if (userMatch) {
                // Grant access to user
                const accessToken = jwt.sign(
                    { "username": foundUser.username },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m' }
                );

                const refreshToken = jwt.sign(
                    { "username": foundUser.username },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '7d' }
                );

                // Save refreshToken with current user
                foundUser.refreshToken = refreshToken;
                await foundUser.save();

                // Send refresh token as a cookie and access token as a response
                res.cookie('jwt', refreshToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production', 
                    sameSite: 'lax', 
                    maxAge: 24 * 60 * 60 * 1000 
                });
                res.json({ 
                    'message': 'Login successful', 
                    'status': 'success',
                    accessToken 
                });
            } else {
                res.status(401).json({ 
                    'message': 'Invalid username or password',
                    'status': 'error'
                });
            }
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ 
                'message': 'An error occurred during login',
                'status': 'error',
                'error': process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }
};

export default handleLogin;