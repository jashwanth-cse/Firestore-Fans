const express = require('express');
const router = express.Router();

const venueController = require('../controllers/venueController');
const { verifyToken } = require('../middleware/authMiddleware');

// All venue routes require authentication
router.use(verifyToken);

// GET /api/venues/all - Get all venues
router.get('/all', venueController.getAllVenues);

module.exports = router;
