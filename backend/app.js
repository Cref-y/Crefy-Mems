const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const memoryRoutes = require('./routes/memory.routes');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/memories', memoryRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;