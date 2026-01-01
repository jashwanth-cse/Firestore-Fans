import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /auth/register
 * Register a new user (handled by Firebase client, this is for additional backend logic)
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        // Additional backend registration logic if needed
        // User creation is handled by Firebase client SDK
        res.json({ message: 'Registration endpoint - use Firebase client SDK' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /auth/login
 * Login endpoint (handled by Firebase client, this is for additional backend logic)
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        // Additional backend login logic if needed
        // Authentication is handled by Firebase client SDK
        res.json({ message: 'Login endpoint - use Firebase client SDK' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
