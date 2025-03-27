const jwt = require('jsonwebtoken');

const auth = (roles) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'HemoNutri');
      console.log('Decoded token:', decoded); // Debug
      req.user = decoded;
      if (roles && !roles.includes(decoded.role)) {
        console.log(`Role ${decoded.role} not authorized for ${req.url}`);
        return res.status(403).json({ error: 'Unauthorized' });
      }
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      res.status(403).json({ error: 'Unauthorized' });
    }
  };
};

module.exports = auth;