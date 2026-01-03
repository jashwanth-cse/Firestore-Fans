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

/**
 * GET /users/profile/:uid
 * Get user profile by UID (public access)
 */
router.get('/profile/:uid', async (req: Request, res: Response) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            res.status(400).json({
                success: false,
                error: 'UID is required'
            });
            return;
        }

        const userDoc = await admin.firestore().collection('users').doc(uid).get();

        if (!userDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
            return;
        }

        const userData = userDoc.data();

        // Return clean profile object
        res.json({
            success: true,
            profile: {
                uid: userDoc.id,
                displayName: userData?.displayName || null,
                email: userData?.email || null,
                department: userData?.department || null,
                role: userData?.role || 'student',
                isHosteler: userData?.isHosteler || false,
                year: userData?.year || null,
                createdAt: userData?.createdAt || null,
            },
        });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
