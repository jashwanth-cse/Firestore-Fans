const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const admin = require('firebase-admin');

/**
 * GET /api/users/profile/:uid
 * Get user profile by UID
 */
router.get('/profile/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                error: 'UID is required'
            });
        }

        const userDoc = await admin.firestore().collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }

        const userData = userDoc.data();

        // Return clean profile object (excluding year as requested)
        res.json({
            success: true,
            profile: {
                uid: userDoc.id,
                displayName: userData?.displayName || null,
                email: userData?.email || null,
                department: userData?.department || null,
                role: userData?.role || 'student',
                isHosteler: userData?.isHosteler || false,
                createdAt: userData?.createdAt || null,
            },
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 */
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }

        res.json({
            success: true,
            profile: userDoc.data(),
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/users/logout
 * Logout user securely
 */
router.post('/logout', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        console.log(`🚪 User logged out: ${userId}`);

        // Firebase logout is client-side, but this endpoint can be used for:
        // - Logging/audit trail
        // - Clearing server-side sessions
        // - Revoking tokens if needed

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
