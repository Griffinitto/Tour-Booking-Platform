const { auth } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Check if using mock auth mode
    if (process.env.USE_JSON_SERVER === 'true') {
      // Mock authentication for JSON Server mode
      if (token === 'mock-jwt-token') {
        req.user = {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser'
        };
        return next();
      } else {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }

    // Firebase token verification
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      username: decodedToken.name || decodedToken.email.split('@')[0]
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };