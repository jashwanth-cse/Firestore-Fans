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
        const { date, startTime, durationHours, seatsRequired, facilitiesRequired, eventName, description } = req.body;

        // Validate input
        if (!date || !startTime || !durationHours || !seatsRequired || !facilitiesRequired) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'All fields are required: date, startTime, durationHours, seatsRequired, facilitiesRequired',
            });
        }

        // Get all active venues
        const allVenues = await firestoreService.getAllVenues();

        // 1. HARD CONSTRAINT: Time Availability
        // We only show venues that are ACTUALLY free at the requested time.
        // We do NOT filter by capacity/facilities yet - we let AI judge that.
        const timeAvailableVenues = allVenues.filter(venue => {
            return venueService.isVenueAvailable(venue, date, startTime, durationHours);
        });

        console.log(`⏱️ Found ${timeAvailableVenues.length} venues available at ${startTime}`);

        if (timeAvailableVenues.length === 0) {
            return res.json({
                success: true,
                count: 0,
                venues: [],
                message: 'No venues available at this time'
            });
        }

        // 2. AI SUITABILITY CHECK
        // If eventName provided, use AI to rank by suitability
        let rankedVenues = [];

        if (eventName) {
            rankedVenues = await geminiService.filterVenuesBySuitability({
                eventName,
                description,
                date,
                startTime,
                seatsRequired,
                facilitiesRequired
            }, timeAvailableVenues);
        } else {
            // Fallback to strict filtering if no event context provided
            console.log('⚠️ No event name provided, falling back to strict filtering');
            rankedVenues = venueService.filterVenuesByRequirements(allVenues, {
                date,
                startTime,
                durationHours,
                seatsRequired,
                facilitiesRequired,
            });
        }

        // TRANSFORM FOR FRONTEND:
        // The frontend expects `isAvailable` boolean and `occupiedTimes` array.
        // Since we already filtered for time availability, we can set isAvailable = true.
        const formattedVenues = rankedVenues.map(venue => {
            // Transform occupancy object to occupiedTimes array (if exists)
            const occupiedTimes = [];
            if (venue.occupancy) {
                Object.keys(venue.occupancy).forEach((occDate) => {
                    Object.keys(venue.occupancy[occDate]).forEach((slot) => {
                        if (venue.occupancy[occDate][slot] === true) {
                            const [sTime, eTime] = slot.split('-');
                            occupiedTimes.push({
                                date: occDate,
                                startTime: sTime,
                                endTime: eTime
                            });
                        }
                    });
                });
            }

            return {
                ...venue,
                venueId: venue.id, // Frontend often uses venueId alias
                isAvailable: true, // We already filtered out occupied ones!
                occupiedTimes: occupiedTimes,
                // Keep AI properties if present
                suitability: venue.suitability
            };
        });

        res.json({
            success: true,
            count: formattedVenues.length,
            venues: formattedVenues,
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
        // Create request (pending state)
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

        // 3. PROVISIONAL BLOCKING
        // Immediately mark the venue as occupied even before approval
        // This prevents double-booking while the admin reviews this request.
        await firestoreService.blockVenueSlot(venueId, date, startTime, durationHours);

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

        console.log(`🔐 Auth Check: User.uid=${req.user?.uid}, Param.userId=${userId}, Role=${req.user?.role}`);

        // Verify user can only access their own requests (or admin)
        if (req.user.uid !== userId && req.user.role !== 'admin') {
            console.error('❌ Forbidden access attempt detected');
            return res.status(403).json({
                error: 'Forbidden',
                message: `You can only access your own requests (User: ${req.user.uid}, Target: ${userId})`
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
        console.log(`🤖 Sync Request - ID: "${approvedEventId}"`);

        if (!approvedEventId) {
            console.error('❌ approvedEventId is missing in body');
            return res.status(400).json({
                error: 'Bad Request',
                message: 'approvedEventId is required',
            });
        }

        // Get approved event
        const event = await firestoreService.getApprovedEvent(approvedEventId);

        console.log(`🔍 Firestore Lookup Result for "${approvedEventId}":`, event ? 'Found' : 'NULL');

        if (!event) {
            console.error(`❌ Event not found in approved_events collection. ID: ${approvedEventId}`);
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

        // Generate Google Calendar Link
        // We use this method because Service Accounts cannot invite attendees (send emails)
        // without Domain-Wide Delegation (which is restricted in many orgs).
        // This method lets the USER add it to their OWN calendar directly.
        const calendarUrl = calendarService.generateGoogleCalendarUrl({
            eventName: event.eventName,
            description: event.description,
            date: event.date,
            startTime: event.startTime,
            durationHours: event.durationHours || 1, // Fallback
            venueName: event.venueName,
        });

        console.log('🔗 Generated Calendar URL:', calendarUrl);

        // Update Firestore to mark as "synced" (optional, but good for UI)
        await firestoreService.updateCalendarId(approvedEventId, 'synced-via-link');

        res.json({
            success: true,
            message: 'Calendar link generated',
            calendarLink: calendarUrl,
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
