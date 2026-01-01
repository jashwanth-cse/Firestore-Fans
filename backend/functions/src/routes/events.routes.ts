import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
    findAvailableVenues,
    createEventRequest,
    getUserPendingRequests,
    getUserApprovedEvents,
    updateCalendarEventId,
} from '../services/firestore.service';
import { extractEventFromText } from '../services/gemini.service';
import { createCalendarEvent } from '../services/googleCalendar.service';

const router = Router();

/**
 * POST /api/events/extract
 * Extract event details from natural language using Gemini AI
 */
router.post('/extract', verifyToken, async (req: Request, res: Response) => {
    try {
        const { userText } = req.body;

        if (!userText || typeof userText !== 'string') {
            res.status(400).json({ error: 'userText is required and must be a string' });
            return;
        }

        console.log('🤖 Extracting event from:', userText);

        // Call Gemini AI to extract event details
        const extractedData = await extractEventFromText(userText);

        // Check if extraction was successful and complete
        if (!extractedData.success) {
            res.status(400).json({
                success: false,
                message: 'Unable to extract complete event details',
                missingFields: extractedData.missingFields || [],
                extractedData: extractedData.data || {},
            });
            return;
        }

        res.json({
            success: true,
            data: extractedData.data,
        });
    } catch (error: any) {
        console.error('Event extraction error:', error);
        res.status(500).json({ error: error.message || 'Failed to extract event details' });
    }
});

/**
 * POST /api/events/findAvailable
 * Find available venues matching requirements
 */
router.post('/findAvailable', verifyToken, async (req: Request, res: Response) => {
    try {
        const { date, startTime, durationHours, seatsRequired, facilitiesRequired } = req.body;

        // Validate required fields
        if (!date || !startTime || !durationHours || !seatsRequired) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        console.log('🔍 Finding venues for:', { date, startTime, durationHours, seatsRequired });

        // Query available venues
        const venues = await findAvailableVenues({
            date,
            startTime,
            durationHours,
            seatsRequired,
            facilitiesRequired: facilitiesRequired || [],
        });

        res.json({
            success: true,
            venues,
            count: venues.length,
        });
    } catch (error: any) {
        console.error('Find venues error:', error);
        res.status(500).json({ error: error.message || 'Failed to find available venues' });
    }
});

/**
 * POST /api/events/suggestAlternative
 * Use AI to suggest alternative venues/times
 */
router.post('/suggestAlternative', verifyToken, async (req: Request, res: Response) => {
    try {
        const eventRequirements = req.body;

        console.log('💡 Suggesting alternatives for:', eventRequirements);

        // TODO: Implement AI-powered suggestions using Gemini
        // For now, return a helpful message
        res.json({
            success: true,
            suggestions: [
                {
                    type: 'time',
                    message: 'Try booking at a different time (e.g., 2 hours later)',
                },
                {
                    type: 'venue',
                    message: 'Consider a similar venue with larger capacity',
                },
                {
                    type: 'date',
                    message: 'The next available date might be tomorrow',
                },
            ],
        });
    } catch (error: any) {
        console.error('Suggest alternatives error:', error);
        res.status(500).json({ error: error.message || 'Failed to suggest alternatives' });
    }
});

/**
 * POST /api/events/submitRequest
 * Submit event request for admin approval
 */
router.post('/submitRequest', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const {
            eventName,
            description,
            date,
            startTime,
            durationHours,
            seatsRequired,
            facilitiesRequired,
            venueId,
            venueName,
        } = req.body;

        // Validate required fields
        if (!eventName || !date || !startTime || !durationHours || !venueId || !venueName) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        console.log('📝 Submitting event request for user:', userId);

        // Create event request
        const requestId = await createEventRequest({
            userId,
            eventName,
            description,
            date,
            startTime,
            durationHours,
            seatsRequired: seatsRequired || 30,
            facilitiesRequired: facilitiesRequired || [],
            venueId,
            venueName,
        });

        res.json({
            success: true,
            requestId,
            message: 'Event request submitted for admin approval',
        });
    } catch (error: any) {
        console.error('Submit request error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit event request' });
    }
});

/**
 * GET /api/events/pending/:userId
 * Get user's pending event requests
 */
router.get('/pending/:userId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const requestUserId = (req as any).user.uid;

        // Ensure user can only access their own requests
        if (userId !== requestUserId) {
            res.status(403).json({ error: 'Unauthorized access' });
            return;
        }

        console.log('📋 Fetching pending requests for user:', userId);

        const requests = await getUserPendingRequests(userId);

        res.json({
            success: true,
            requests,
            count: requests.length,
        });
    } catch (error: any) {
        console.error('Get pending error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch pending requests' });
    }
});

/**
 * GET /api/events/approved/:userId
 * Get user's approved events
 */
router.get('/approved/:userId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const requestUserId = (req as any).user.uid;

        // Ensure user can only access their own events
        if (userId !== requestUserId) {
            res.status(403).json({ error: 'Unauthorized access' });
            return;
        }

        console.log('✅ Fetching approved events for user:', userId);

        const events = await getUserApprovedEvents(userId);

        res.json({
            success: true,
            events,
            count: events.length,
        });
    } catch (error: any) {
        console.error('Get approved error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch approved events' });
    }
});

/**
 * POST /api/events/syncCalendar
 * Sync approved event to Google Calendar
 */
router.post('/syncCalendar', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.uid;
        const { approvedEventId } = req.body;

        if (!approvedEventId) {
            res.status(400).json({ error: 'approvedEventId is required' });
            return;
        }

        console.log('📅 Syncing event to Google Calendar:', approvedEventId);

        //Get the approved event data
        const events = await getUserApprovedEvents(userId);
        const event = events.find((e: any) => e.eventId === approvedEventId);

        if (!event) {
            res.status(404).json({ error: 'Event not found or not owned by user' });
            return;
        }

        // Create Google Calendar event
        const calendarEvent = await createCalendarEvent({
            summary: event.eventName,
            description: event.description || '',
            location: event.venueName,
            start: {
                dateTime: `${event.date}T${event.startTime}:00`,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: calculateEndTime(event.date, event.startTime, event.durationHours),
                timeZone: 'Asia/Kolkata',
            },
        });

        // Update Firestore with calendar event ID
        await updateCalendarEventId(approvedEventId, calendarEvent.id);

        res.json({
            success: true,
            calendarEventId: calendarEvent.id,
            message: 'Event synced to Google Calendar successfully',
        });
    } catch (error: any) {
        console.error('Calendar sync error:', error);
        res.status(500).json({ error: error.message || 'Failed to sync to Google Calendar' });
    }
});

/**
 * Helper function to calculate end time
 */
function calculateEndTime(date: string, startTime: string, durationHours: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${date}T${endTime}:00`;
}

export default router;
