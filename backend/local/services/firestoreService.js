const admin = require('firebase-admin');

// Lazy initialization - don't access firestore at module load time
const getDb = () => admin.firestore();

/**
 * Firestore Service - Database operations
 */

// ================== VENUE OPERATIONS ==================

/**
 * Get venue by ID
 */
async function getVenue(venueId) {
    const venueDoc = await getDb().collection('event_venues').doc(venueId).get();

    if (!venueDoc.exists) {
        return null;
    }

    return {
        id: venueDoc.id,
        ...venueDoc.data(),
    };
}

/**
 * Get all active venues
 */
async function getAllVenues() {
    const snapshot = await getDb().collection('event_venues')
        .where('isActive', '==', true)
        .get();

    const venues = [];
    snapshot.forEach(doc => {
        venues.push({
            id: doc.id,
            ...doc.data(),
        });
    });

    return venues;
}

/**
 * Update venue occupied slots
 * @param {string} venueId 
 * @param {object} slot - {date, startTime, endTime, eventId}
 * @param {string} action - 'add' or 'remove'
 */
/**
 * Block a specific venue slot (Provisional Booking)
 * @param {string} venueId
 * @param {string} date - YYYY-MM-DD
 * @param {string} startTime - HH:mm
 * @param {number} durationHours
 */
async function blockVenueSlot(venueId, date, startTime, durationHours) {
    const venueRef = getDb().collection('event_venues').doc(venueId);

    // Calculate end time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + (durationHours * 60);
    const endHour = Math.floor(totalMinutes / 60);
    const endStr = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

    // Construct slot key e.g. "10:00-12:00"
    const slotKey = `${startTime}-${endStr}`;

    console.log(`🔒 Blocking venue ${venueId} for slot ${slotKey} on ${date}`);

    // Update the occupancy map
    // We use dot notation to update nested fields without overwriting the whole map
    await venueRef.update({
        [`occupancy.${date}.${slotKey}`]: true
    });
}

// ================== EVENT REQUEST OPERATIONS ==================

/**
 * Create event request (pending approval)
 */
async function createEventRequest(data) {
    const requestRef = getDb().collection('event_requests').doc();

    await requestRef.set({
        ...data,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return requestRef.id;
}

/**
 * Get event request by ID
 */
async function getEventRequest(requestId) {
    const requestDoc = await getDb().collection('event_requests').doc(requestId).get();

    if (!requestDoc.exists) {
        return null;
    }

    return {
        id: requestDoc.id,
        ...requestDoc.data(),
    };
}

/**
 * Get pending requests for a user
 */
async function getPendingRequests(userId) {
    const snapshot = await getDb().collection('event_requests')
        .where('userId', '==', userId)
        // .orderBy('createdAt', 'desc') // REMOVED to avoid index requirement
        .get();

    const requests = [];
    snapshot.forEach(doc => {
        requests.push({
            id: doc.id,
            ...doc.data(),
        });
    });

    // Sort in memory instead
    requests.sort((a, b) => {
        // Handle timestamps that might be Firestore objects or dates
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA; // Descending
    });

    return requests;
}

/**
 * Get all pending requests (admin view)
 */
async function getAllPendingRequests() {
    const snapshot = await getDb().collection('event_requests')
        .orderBy('createdAt', 'desc')
        .get();

    const requests = [];
    snapshot.forEach(doc => {
        requests.push({
            ...doc.data(),
            id: doc.id,
        });
    });

    return requests;
}

/**
 * Delete event request
 */
async function deleteEventRequest(requestId) {
    await getDb().collection('event_requests').doc(requestId).delete();
}

// ================== APPROVED EVENT OPERATIONS ==================

/**
 * Create approved event
 */
async function createApprovedEvent(data) {
    const eventRef = getDb().collection('approved_events').doc();

    await eventRef.set({
        ...data,
        status: 'approved',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return eventRef.id;
}

/**
 * Get approved events for a user
 */
async function getApprovedEvents(userId) {
    const snapshot = await getDb().collection('approved_events')
        .where('userId', '==', userId)
        // .orderBy('date', 'asc') // Removed to avoid index
        .get();

    const events = [];
    snapshot.forEach(doc => {
        events.push({
            ...doc.data(),
            id: doc.id,
        });
    });

    // Sort in memory (ascending date)
    events.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateA - dateB;
    });

    return events;
}

/**
 * Get approved event by ID
 */
async function getApprovedEvent(eventId) {
    const eventDoc = await getDb().collection('approved_events').doc(eventId).get();

    if (!eventDoc.exists) {
        return null;
    }

    return {
        id: eventDoc.id,
        ...eventDoc.data(),
    };
}

/**
 * Update calendar event ID in approved event
 */
async function updateCalendarId(eventId, calendarEventId) {
    await getDb().collection('approved_events').doc(eventId).update({
        calendarEventId,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ================== EXPORTS ==================

module.exports = {
    // Venue operations
    getVenue,
    getAllVenues,
    // updateVenueOccupancy, // Removed (replaced by blockVenueSlot)

    // Request operations
    createEventRequest,
    getEventRequest,
    getPendingRequests,
    getAllPendingRequests,
    deleteEventRequest,

    // Approved event operations
    createApprovedEvent,
    getApprovedEvents,
    getApprovedEvent,
    updateCalendarId,
    blockVenueSlot, // Exported
};
