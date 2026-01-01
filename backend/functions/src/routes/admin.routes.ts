import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
    getAllPendingRequests,
    approveEventRequest,
    rejectEventRequest,
} from '../services/firestore.service';
import * as admin from 'firebase-admin';

const router = Router();

/**
 * Middleware to verify admin role
 */
const verifyAdmin = async (req: Request, res: Response, next: any) => {
    try {
        const userId = (req as any).user.uid;

        // Fetch user document from Firestore
        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const userData = userDoc.data();

        // Check if user has admin role
        if (userData?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden - Admin access required' });
            return;
        }

        next();
    } catch (error: any) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Failed to verify admin role' });
    }
};

/**
 * GET /api/admin/pending
 * Get all pending event requests (admin view)
 */
router.get('/pending', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
    try {
        console.log('🛡️ Admin fetching all pending requests');

        const requests = await getAllPendingRequests();

        res.json({
            success: true,
            requests,
            count: requests.length,
        });
    } catch (error: any) {
        console.error('Admin get pending error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch pending requests' });
    }
});

/**
 * POST /api/admin/approve
 * Approve a pending event request
 */
router.post('/approve', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user.uid;
        const { requestId } = req.body;

        if (!requestId) {
            res.status(400).json({ error: 'requestId is required' });
            return;
        }

        console.log(`✅ Admin ${adminId} approving request:`, requestId);

        const approvedEventId = await approveEventRequest(requestId, adminId);

        res.json({
            success: true,
            approvedEventId,
            message: 'Event request approved successfully',
        });
    } catch (error: any) {
        console.error('Admin approve error:', error);

        // Handle specific errors
        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        if (error.message.includes('no longer available')) {
            res.status(409).json({ error: 'Venue is no longer available for this time slot' });
            return;
        }

        res.status(500).json({ error: error.message || 'Failed to approve request' });
    }
});

/**
 * POST /api/admin/reject
 * Reject a pending event request
 */
router.post('/reject', verifyToken, verifyAdmin, async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user.uid;
        const { requestId, reason } = req.body;

        if (!requestId) {
            res.status(400).json({ error: 'requestId is required' });
            return;
        }

        console.log(`❌ Admin ${adminId} rejecting request:`, requestId);

        await rejectEventRequest(requestId, reason);

        res.json({
            success: true,
            message: 'Event request rejected successfully',
        });
    } catch (error: any) {
        console.error('Admin reject error:', error);

        if (error.message.includes('not found')) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        res.status(500).json({ error: error.message || 'Failed to reject request' });
    }
});

export default router;
