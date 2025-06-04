const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/auth');

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        req.user = { sub: decoded.sub };
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};