const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');

// All event routes require authentication
router.use(verifyToken);

// POST /api/events/extract - Extract event from natural language
router.post('/extract', eventController.extractEvent);

// POST /api/events/findAvailable - Find available venues
router.post('/findAvailable', eventController.findAvailableVenues);

// POST /api/events/suggestAlternative - Get AI venue suggestions
router.post('/suggestAlternative', eventController.suggestAlternatives);

// POST /api/events/submitRequest - Submit event for approval
router.post('/submitRequest', eventController.submitRequest);

// GET /api/events/pending/:userId - Get user's pending requests
router.get('/pending/:userId', eventController.getPendingEvents);

// GET /api/events/approved/:userId - Get user's approved events
router.get('/approved/:userId', eventController.getApprovedEvents);

// POST /api/events/syncCalendar - Sync event to Google Calendar
router.post('/syncCalendar', eventController.syncToCalendar);

module.exports = router;
