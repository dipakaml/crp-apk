import jwt from 'jsonwebtoken';
import config from '../config.js';

function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_ADMIN_PASSWORD); // or your admin secret key
    req.adminId = decoded._id || decoded.id;  // set adminId here properly, depending on token payload
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token or expired token' });
  }
}

export default adminMiddleware;
