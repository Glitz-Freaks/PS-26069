import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mausamvani_super_secret_jwt_key_2026';

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. Official authentication token is required.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired administrative token. Please log in again.'
    });
  }
}
