const admin = require('firebase-admin');
const firestoreService = require('../services/firestoreService');
const venueService = require('../services/venueService');
const { calculateEndTime } = require('../utils/timeUtils');

/**
 * POST /api/admin/approve
 * Admin approves a pending event request
 */
async function approveRequest(req, res) {
    try {
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'requestId is required',
            });
        }

        // Get the pending request
        const request = await firestoreService.getEventRequest(requestId);

        if (!request) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Event request not found',
            });
        }

        // NOTE: We do NOT re-check venue availability here because:
        // 1. The slot was already validated when the request was submitted
        // 2. The slot is provisionally blocked in the occupancy map
        // 3. Re-checking would falsely detect the provisional block as a conflict
        // The approval simply confirms the provisional booking

        // Use Firestore transaction to ensure atomicity
        const db = admin.firestore();

        await db.runTransaction(async (transaction) => {
            // Calculate end time
            const endTime = calculateEndTime(request.startTime, request.durationHours);

            // Create approved event
            const approvedEventRef = db.collection('approved_events').doc();
            transaction.set(approvedEventRef, {
                ...request,
                status: 'approved',
                approvedBy: req.user.uid,
                approvedAt: admin.firestore.FieldValue.serverTimestamp(),
                calendarEventId: null,
            });

            // NOTE: We do NOT update occupiedSlots here because:
            // The slot was already added to occupiedSlots during provisional blocking
            // Firestore doesn't support updating array elements, so the status remains 'pending'
            // The occupancy map is the source of truth for validation anyway

            // Delete from pending requests
            const requestRef = db.collection('event_requests').doc(requestId);
            transaction.delete(requestRef);
        });

        res.json({
            success: true,
            message: 'Event request approved successfully',
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * POST /api/admin/reject
 * Admin rejects a pending event request
 */
async function rejectRequest(req, res) {
    try {
        const { requestId, reason } = req.body;

        if (!requestId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'requestId is required',
            });
        }

        // Get the pending request
        const request = await firestoreService.getEventRequest(requestId);

        if (!request) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Event request not found',
            });
        }

        // Delete the request
        await firestoreService.deleteEventRequest(requestId);

        // TODO: Send notification to user about rejection (future feature)
        // await sendRejectionNotification(request.userId, request.eventName, reason);

        res.json({
            success: true,
            message: 'Event request rejected successfully',
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * GET /api/admin/pending
 * Get all pending requests (admin view)
 */
async function getAllPendingRequests(req, res) {
    try {
        const pendingRequests = await firestoreService.getAllPendingRequests();

        res.json({
            success: true,
            count: pendingRequests.length,
            requests: pendingRequests,
        });
    } catch (error) {
        console.error('Get all pending requests error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

module.exports = {
    approveRequest,
    rejectRequest,
    getAllPendingRequests,
};
