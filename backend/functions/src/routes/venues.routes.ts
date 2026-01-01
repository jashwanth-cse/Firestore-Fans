import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getAllVenues } from '../services/venues.service';

const router = Router();

/**
 * GET /api/venues/all
 * Get all venues with their occupancy status
 */
router.get('/all', verifyToken, async (req: Request, res: Response) => {
    try {
        console.log('📍 Fetching all venues');

        const venues = await getAllVenues();

        res.json({
            success: true,
            venues,
            count: venues.length,
        });
    } catch (error: any) {
        console.error('Get all venues error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch venues' });
    }
});

export default router;
