// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'invalid_token' });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'forbidden' });
      }

      req.user = { id: user._id, role: user.role };
      next();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Auth error:`, err.stack);
      return res.status(401).json({ error: 'invalid_token' });
    }
  };
};

module.exports = auth;