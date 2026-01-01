const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');

// All admin routes require authentication AND admin role
router.use(verifyToken);
router.use(verifyAdmin);

// POST /api/admin/approve - Approve pending request
router.post('/approve', adminController.approveRequest);

// POST /api/admin/reject - Reject pending request
router.post('/reject', adminController.rejectRequest);

// GET /api/admin/pending - Get all pending requests
router.get('/pending', adminController.getAllPendingRequests);

module.exports = router;
