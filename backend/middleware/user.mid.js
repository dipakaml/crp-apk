import jwt from 'jsonwebtoken';
import config from '../config.js';

function userMiddleware(req, res, next) {
    const authHeader = req.cookies.jwt; // Corrected: req.cookies.jwt

    if (!authHeader) { // Corrected: Simplified token check
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader; // Corrected: Use token directly

    try {
        const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
        req.user = decoded; // Corrected: req.user instead of req.userId
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token or expired token' });
    }
}

export default userMiddleware;