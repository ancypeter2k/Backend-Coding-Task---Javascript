import express from 'express';
import 'dotenv/config';
import sequelize from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import partRoutes from './routes/partRoutes.js';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/part', partRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
});
