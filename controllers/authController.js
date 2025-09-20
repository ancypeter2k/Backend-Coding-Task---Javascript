import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

class AuthController {
    async register(req, res) {
        const { username, password, role } = req.body;
        try {
            const user = await User.create({ username, password, role });
            res.status(201).json({ id: user.id, username: user.username, role: user.role });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.json({ token });
    }
}

export default new AuthController();
