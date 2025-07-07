const { auth } = require('../config/firebase');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if using mock auth mode
    if (process.env.USE_JSON_SERVER === 'true') {
      // Mock authentication for JSON Server mode
      if (email === 'test@example.com' && password === 'password') {
        return res.json({
          user: {
            id: 'user-1',
            email: 'test@example.com',
            username: 'testuser'
          },
          token: 'mock-jwt-token'
        });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    // Firebase authentication
    const userRecord = await auth.getUserByEmail(email);
    
    // In a real app, you'd verify the password here
    // For demo purposes, we'll just return user info
    res.json({
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName || email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if using mock auth mode
    if (process.env.USE_JSON_SERVER === 'true') {
      // Mock registration for JSON Server mode
      return res.json({
        user: {
          id: 'user-new',
          email,
          username
        },
        token: 'mock-jwt-token'
      });
    }
    
    // Firebase user creation
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username
    });
    
    res.status(201).json({
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
};

module.exports = {
  login,
  register
};