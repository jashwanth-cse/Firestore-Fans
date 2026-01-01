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
async function updateVenueOccupancy(venueId, slot, action = 'add') {
    const venueRef = getDb().collection('event_venues').doc(venueId);

    if (action === 'add') {
        await venueRef.update({
            occupiedSlots: admin.firestore.FieldValue.arrayUnion(slot),
        });
    } else if (action === 'remove') {
        await venueRef.update({
            occupiedSlots: admin.firestore.FieldValue.arrayRemove(slot),
        });
    }
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
        .orderBy('createdAt', 'desc')
        .get();

    const requests = [];
    snapshot.forEach(doc => {
        requests.push({
            id: doc.id,
            ...doc.data(),
        });
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
            id: doc.id,
            ...doc.data(),
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
        .orderBy('date', 'asc')
        .get();

    const events = [];
    snapshot.forEach(doc => {
        events.push({
            id: doc.id,
            ...doc.data(),
        });
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
    updateVenueOccupancy,

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
};

