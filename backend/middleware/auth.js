const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication failed. No token provided.' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
    req.userData = { userId: decodedToken.userId, tenantId: decodedToken.tenantId };
    // attach current user document if needed
    try {
      req.currentUser = await User.findById(decodedToken.userId);
    } catch (e) {
      req.currentUser = null;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed!' });
  }
};
