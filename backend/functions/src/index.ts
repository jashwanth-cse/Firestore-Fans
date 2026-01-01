import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes';
import eventsRoutes from './routes/events.routes';
import travelRoutes from './routes/travel.routes';
import usersRoutes from './routes/users.routes';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/travel', travelRoutes);
app.use('/users', usersRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'NexSync API is running' });
});

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);
