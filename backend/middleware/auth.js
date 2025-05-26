  const jwt = require('jsonwebtoken');

  const auth = (roles) => {
    return (req, res, next) => {
      console.log('auth: Processing request', { path: req.path, method: req.method });
      const token = req.header('Authorization')?.replace('Bearer ', '');
      console.log('auth: Checking token', { token: token?.slice(0, 10) + '...' });
      
      if (!token) {
        console.log('auth: No token provided');
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('auth: Token verified', { userId: decoded.id, role: decoded.role });
        req.user = decoded;
        if (roles && !roles.includes(decoded.role)) {
          console.log('auth: Insufficient permissions', { role: decoded.role, required: roles });
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
      } catch (err) {
        console.error('auth: Token verification error:', err.stack);
        if (err.name === 'TokenExpiredError') {
          console.log('auth: Token expired', { userId: req.user?.id });
          return res.status(401).json({ error: 'token_expired' });
        }
        return res.status(401).json({ error: 'invalid_token' });
      }
    };
  };

  module.exports = auth;