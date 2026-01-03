// Load .env ONLY for local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const venueRoutes = require('./routes/venueRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// Cloud Run / App Hosting ALWAYS injects PORT (usually 8080)
const PORT = process.env.PORT ?? 8080;

// Initialize Firebase Admin SDK (Cloud Run safe)
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

console.log('✅ Firebase Admin SDK initialized');

// ============================
// Middleware
// ============================

// SAFE handling of ALLOWED_ORIGINS (prevents crash in App Hosting)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);

        // Allow any ngrok subdomain (mobile testing)
        if (origin.includes('.ngrok-free.app')) {
            console.log(`✅ CORS: Allowing ngrok origin: ${origin}`);
            return callback(null, true);
        }

        // Allow if ALLOWED_ORIGINS is empty (safe default for App Hosting)
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================
// Health Check (MANDATORY)
// ============================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend Running OK',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
// ============================
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/users', userRoutes);

// ============================
// 404 Handler
// ============================
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// ============================
// Global Error Handler
// ============================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ============================
// Start Server (Cloud Run Ready)
// ============================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📝 Health check available at /health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
