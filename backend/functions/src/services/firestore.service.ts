import * as admin from 'firebase-admin';

/**
 * Firestore Service for EventSync
 * Handles all database operations for venues, event requests, and approved events
 */

const db = admin.firestore();

interface VenueRequirements {
    date: string;
    startTime: string;
    durationHours: number;
    seatsRequired: number;
    facilitiesRequired: string[];
}

interface Venue {
    venueId: string;
    name: string;
    type: string;
    capacity: number;
    facilities: string[];
    occupancy?: Record<string, Record<string, boolean>>;
}

interface EventRequest {
    eventName: string;
    description?: string;
    date: string;
    startTime: string;
    durationHours: number;
    seatsRequired: number;
    facilitiesRequired: string[];
    venueId: string;
    venueName: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: admin.firestore.Timestamp;
    assignedAdmin?: string;
}

/**
 * Generate time slot key from start time and duration
 * Example: startTime="14:00", duration=2 -> "14:00-16:00"
 */
function generateTimeSlotKey(startTime: string, durationHours: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${startTime}-${endTime}`;
}

/**
 * Check if a venue is occupied for a specific date and time slot
 */
export async function checkVenueOccupancy(
    venueId: string,
    date: string,
    timeSlot: string
): Promise<boolean> {
    const venueRef = db.collection('venues').doc(venueId);
    const venueSnap = await venueRef.get();

    if (!venueSnap.exists) {
        throw new Error(`Venue ${venueId} not found`);
    }

    const venue = venueSnap.data() as Venue;
    const occupancy = venue.occupancy || {};

    // Check if the date exists and if the time slot is occupied
    return occupancy[date]?.[timeSlot] === true;
}

/**
 * Update venue occupancy for a specific date and time slot
 */
export async function updateVenueOccupancy(
    venueId: string,
    date: string,
    timeSlot: string,
    occupied: boolean
): Promise<void> {
    const venueRef = db.collection('venues').doc(venueId);
    const venueSnap = await venueRef.get();

    if (!venueSnap.exists) {
        throw new Error(`Venue ${venueId} not found`);
    }

    const venue = venueSnap.data() as Venue;
    const occupancy = venue.occupancy || {};

    // Initialize date if it doesn't exist
    if (!occupancy[date]) {
        occupancy[date] = {};
    }

    // Update the time slot
    occupancy[date][timeSlot] = occupied;

    // Update Firestore
    await venueRef.update({ occupancy });
}

/**
 * Find available venues matching requirements
 */
export async function findAvailableVenues(
    requirements: VenueRequirements
): Promise<any[]> {
    const { date, startTime, durationHours, seatsRequired, facilitiesRequired } = requirements;
    const timeSlot = generateTimeSlotKey(startTime, durationHours);

    // Query all venues
    const venuesSnapshot = await db.collection('venues').get();

    const availableVenues: any[] = [];

    for (const venueDoc of venuesSnapshot.docs) {
        const venueData = venueDoc.data();

        // Check capacity
        if (venueData.capacity < seatsRequired) {
            continue;
        }

        // Check facilities
        const hasFacilities = facilitiesRequired.every((required) =>
            (venueData.facilities || []).includes(required)
        );
        if (!hasFacilities) {
            continue;
        }

        // Check occupancy
        const isOccupied = await checkVenueOccupancy(venueDoc.id, date, timeSlot);
        if (isOccupied) {
            continue;
        }

        // Transform to frontend format
        const occupiedTimes: any[] = [];
        if (venueData.occupancy) {
            // Convert occupancy object to occupiedTimes array
            Object.keys(venueData.occupancy).forEach((occDate) => {
                Object.keys(venueData.occupancy[occDate]).forEach((slot) => {
                    if (venueData.occupancy[occDate][slot] === true) {
                        const [startTime, endTime] = slot.split('-');
                        occupiedTimes.push({
                            date: occDate,
                            startTime,
                            endTime
                        });
                    }
                });
            });
        }

        // Return in frontend-expected format
        availableVenues.push({
            id: venueDoc.id,
            venueId: venueDoc.id,
            name: venueData.name,
            type: venueData.type,
            capacity: venueData.capacity,
            facilities: venueData.facilities || [],
            isAvailable: !isOccupied, // TRUE because we filtered out occupied ones
            occupiedTimes, // Array of occupied time slots
            building: venueData.building,
            floor: venueData.floor,
        });
    }

    return availableVenues;
}

/**
 * Create a new event request (pending approval)
 */
export async function createEventRequest(
    data: Omit<EventRequest, 'status' | 'createdAt'>
): Promise<string> {
    const requestData: EventRequest = {
        ...data,
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection('event_requests').add(requestData);
    return docRef.id;
}

/**
 * Get user's pending event requests
 */
export async function getUserPendingRequests(userId: string): Promise<any[]> {
    const snapshot = await db
        .collection('event_requests')
        .where('userId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map((doc) => ({ requestId: doc.id, ...doc.data() }));
}

/**
 * Get user's approved events
 */
export async function getUserApprovedEvents(userId: string): Promise<any[]> {
    const snapshot = await db
        .collection('approved_events')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .get();

    return snapshot.docs.map((doc) => ({ eventId: doc.id, ...doc.data() }));
}

/**
 * Get all pending requests (admin view)
 */
export async function getAllPendingRequests(): Promise<any[]> {
    const snapshot = await db
        .collection('event_requests')
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'asc')
        .get();

    return snapshot.docs.map((doc) => ({ requestId: doc.id, ...doc.data() }));
}

/**
 * Approve an event request
 * Moves from event_requests to approved_events and updates venue occupancy
 */
export async function approveEventRequest(
    requestId: string,
    adminId: string
): Promise<string> {
    // Get the request
    const requestRef = db.collection('event_requests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
        throw new Error('Request not found');
    }

    const request = requestSnap.data() as EventRequest;

    // Generate time slot
    const timeSlot = generateTimeSlotKey(request.startTime, request.durationHours);

    // Check if venue is still available (prevent race conditions)
    const isOccupied = await checkVenueOccupancy(request.venueId, request.date, timeSlot);
    if (isOccupied) {
        throw new Error('Venue is no longer available for this time slot');
    }

    // Update venue occupancy
    await updateVenueOccupancy(request.venueId, request.date, timeSlot, true);

    // Create approved event
    const approvedEvent = {
        ...request,
        requestId,
        approvedBy: adminId,
        approvedAt: admin.firestore.Timestamp.now(),
        status: 'approved',
        calendarEventId: null, // Will be set when synced to calendar
    };

    const approvedDocRef = await db.collection('approved_events').add(approvedEvent);

    // Delete the request
    await requestRef.delete();

    return approvedDocRef.id;
}

/**
 * Reject an event request
 */
export async function rejectEventRequest(
    requestId: string,
    reason?: string
): Promise<void> {
    const requestRef = db.collection('event_requests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
        throw new Error('Request not found');
    }

    // Optionally, we could move to a 'rejected_requests' collection for history
    // For now, just delete it
    await requestRef.delete();

    console.log(`Request ${requestId} rejected${reason ? `: ${reason}` : ''}`);
}

/**
 * Update approved event with calendar event ID
 */
export async function updateCalendarEventId(
    approvedEventId: string,
    calendarEventId: string
): Promise<void> {
    await db.collection('approved_events').doc(approvedEventId).update({ calendarEventId });
}
