import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

export default app;