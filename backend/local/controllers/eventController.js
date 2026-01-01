const geminiService = require('../services/geminiService');
const firestoreService = require('../services/firestoreService');
const venueService = require('../services/venueService');
const calendarService = require('../services/calendarService');
const { validateEventData, sanitizeInput } = require('../utils/validateEventData');
const { calculateEndTime } = require('../utils/timeUtils');

/**
 * POST /api/events/extract
 * Extract event data from natural language using Gemini AI
 */
async function extractEvent(req, res) {
    try {
        const { userText } = req.body;

        if (!userText || userText.trim() === '') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'userText is required',
            });
        }

        // Sanitize input
        const sanitized = sanitizeInput(userText);

        // Extract event data using Gemini AI
        const extractedData = await geminiService.extractEventData(sanitized);

        // Validate extracted data
        const validation = validateEventData(extractedData);

        if (!validation.valid) {
            return res.status(400).json({
                error: 'Validation Failed',
                message: 'Extracted data is invalid',
                errors: validation.errors,
                extractedData, // Return for debugging
            });
        }

        res.json({
            success: true,
            data: extractedData,
        });
    } catch (error) {
        console.error('Extract event error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * POST /api/events/findAvailable
 * Find available venues matching requirements
 */
async function findAvailableVenues(req, res) {
    try {
        const { date, startTime, durationHours, seatsRequired, facilitiesRequired } = req.body;

        // Validate input
        if (!date || !startTime || !durationHours || !seatsRequired || !facilitiesRequired) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'All fields are required: date, startTime, durationHours, seatsRequired, facilitiesRequired',
            });
        }

        // Get all active venues
        const allVenues = await firestoreService.getAllVenues();

        // Filter by requirements
        const availableVenues = venueService.filterVenuesByRequirements(allVenues, {
            date,
            startTime,
            durationHours,
            seatsRequired,
            facilitiesRequired,
        });

        res.json({
            success: true,
            count: availableVenues.length,
            venues: availableVenues,
        });
    } catch (error) {
        console.error('Find available venues error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * POST /api/events/suggestAlternative
 * Get AI-powered alternative venue suggestions
 */
async function suggestAlternatives(req, res) {
    try {
        const eventRequirements = req.body;

        // Validate input
        if (!eventRequirements.date || !eventRequirements.seatsRequired) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Event requirements are incomplete',
            });
        }

        // Get all venues
        const allVenues = await firestoreService.getAllVenues();

        // Get AI suggestions
        const suggestions = await geminiService.suggestAlternatives(eventRequirements, allVenues);

        // Enrich suggestions with full venue details
        const enrichedSuggestions = suggestions.map(suggestion => {
            const venue = allVenues.find(v => v.id === suggestion.venueId);
            return {
                ...suggestion,
                venue,
            };
        });

        res.json({
            success: true,
            suggestions: enrichedSuggestions,
        });
    } catch (error) {
        console.error('Suggest alternatives error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * POST /api/events/submitRequest
 * Submit event request for admin approval
 */
async function submitRequest(req, res) {
    try {
        const userId = req.user.uid;
        const userEmail = req.user.email;

        const {
            eventName,
            description,
            date,
            startTime,
            durationHours,
            seatsRequired,
            facilitiesRequired,
            venueId,
        } = req.body;

        // Validate input
        if (!eventName || !date || !startTime || !durationHours || !seatsRequired || !venueId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required fields',
            });
        }

        // Get venue details
        const venue = await firestoreService.getVenue(venueId);

        if (!venue) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Venue not found',
            });
        }

        // Check venue availability (prevent race conditions)
        const isAvailable = venueService.isVenueAvailable(venue, date, startTime, durationHours);

        if (!isAvailable) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Venue is no longer available for the requested time slot',
            });
        }

        // Create request
        const requestId = await firestoreService.createEventRequest({
            userId,
            userEmail,
            eventName,
            description: description || '',
            date,
            startTime,
            durationHours,
            seatsRequired,
            facilitiesRequired,
            venueId,
            venueName: venue.name,
        });

        res.status(201).json({
            success: true,
            message: 'Event request submitted for admin approval',
            requestId,
        });
    } catch (error) {
        console.error('Submit request error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * GET /api/events/pending/:userId
 * Get user's pending event requests
 */
async function getPendingEvents(req, res) {
    try {
        const { userId } = req.params;

        // Verify user can only access their own requests (or admin)
        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own requests',
            });
        }

        const pendingEvents = await firestoreService.getPendingRequests(userId);

        res.json({
            success: true,
            count: pendingEvents.length,
            events: pendingEvents,
        });
    } catch (error) {
        console.error('Get pending events error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * GET /api/events/approved/:userId
 * Get user's approved events
 */
async function getApprovedEvents(req, res) {
    try {
        const { userId } = req.params;

        // Verify user can only access their own events (or admin)
        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own events',
            });
        }

        const approvedEvents = await firestoreService.getApprovedEvents(userId);

        res.json({
            success: true,
            count: approvedEvents.length,
            events: approvedEvents,
        });
    } catch (error) {
        console.error('Get approved events error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

/**
 * POST /api/events/syncCalendar
 * Sync approved event to Google Calendar
 */
async function syncToCalendar(req, res) {
    try {
        const { approvedEventId } = req.body;

        if (!approvedEventId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'approvedEventId is required',
            });
        }

        // Get approved event
        const event = await firestoreService.getApprovedEvent(approvedEventId);

        if (!event) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Approved event not found',
            });
        }

        // Verify user owns the event
        if (event.userId !== req.user.uid) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only sync your own events',
            });
        }

        // Check if already synced
        if (event.calendarEventId) {
            return res.status(400).json({
                error: 'Already Synced',
                message: 'This event is already synced to Google Calendar',
                calendarEventId: event.calendarEventId,
            });
        }

        // Create Google Calendar event
        const calendarResult = await calendarService.createCalendarEvent({
            eventName: event.eventName,
            description: event.description,
            date: event.date,
            startTime: event.startTime,
            durationHours: event.durationHours,
            venueName: event.venueName,
        });

        // Update Firestore with calendar event ID
        await firestoreService.updateCalendarId(approvedEventId, calendarResult.calendarEventId);

        res.json({
            success: true,
            message: 'Event synced to Google Calendar',
            calendarEventId: calendarResult.calendarEventId,
            calendarLink: calendarResult.htmlLink,
        });
    } catch (error) {
        console.error('Sync to calendar error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

module.exports = {
    extractEvent,
    findAvailableVenues,
    suggestAlternatives,
    submitRequest,
    getPendingEvents,
    getApprovedEvents,
    syncToCalendar,
};
