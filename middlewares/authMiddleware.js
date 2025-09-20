import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import 'dotenv/config';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) throw new Error('User not found');
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;
