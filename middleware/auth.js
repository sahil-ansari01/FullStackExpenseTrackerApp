const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secretKey = process.env.SECRET_KEY;

exports.middleParseToken = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) {
            return res.status(400).json({ success: false, message: 'No token provided' });
        }
        const obj = jwt.verify(token, secretKey);
        req.body.userId = obj.userId;
        next();
    } catch (err) {
        console.error('Error in middleParseToken:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, secretKey);
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

module.exports = {
    middleParseToken: exports.middleParseToken,
    authenticate: exports.authenticate
};