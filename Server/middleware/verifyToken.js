import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    console.log("Auth header:", authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized', details: 'Missing or invalid Authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded token:", decoded);
        
        // Set the username on the request object
        req.user = decoded.username;
        console.log("Set req.user to:", req.user);
        
        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ message: 'Forbidden', details: 'Invalid or expired token' });
    }
}; 