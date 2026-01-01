import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import * as admin from 'firebase-admin';

const router = Router();

/**
 * GET /users/profile
 * Get user profile
 */
router.get('/profile', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;

        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }

        res.json({
            profile: userDoc.data(),
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /users/profile
 * Update user profile
 */
router.put('/profile', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated directly
        delete updates.uid;
        delete updates.email;
        delete updates.createdAt;

        await admin.firestore().collection('users').doc(userId).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
