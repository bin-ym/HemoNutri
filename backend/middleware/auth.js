const jwt = require('jsonwebtoken');

const auth = (roles) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'HemoNutri');
      req.user = decoded;
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      console.error('Auth middleware error:', err);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = auth;