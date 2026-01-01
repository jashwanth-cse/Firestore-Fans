const { getAllVenues } = require('./firestoreService');

/**
 * Check if a venue is available for a specific time slot
 * @param {object} venue - Venue document
 * @param {string} date - "YYYY-MM-DD"
 * @param {string} startTime - "HH:MM"
 * @param {number} durationHours - Duration in hours
 * @returns {boolean} - true if available, false if occupied
 */
function isVenueAvailable(venue, date, startTime, durationHours) {
    // Calculate end time
    const [startH, startM] = startTime.split(':').map(Number);
    const endH = startH + Math.floor(durationHours);
    const endM = startM + ((durationHours % 1) * 60);
    const endTime = `${String(endH).padStart(2, '0')}:${String(Math.floor(endM)).padStart(2, '0')}`;

    // Check each occupied slot
    for (const slot of venue.occupiedSlots || []) {
        // Only check slots on the same date
        if (slot.date !== date) continue;

        // Check if time slots overlap
        const hasConflict = checkTimeSlotConflict(
            slot.startTime,
            slot.endTime,
            startTime,
            endTime
        );

        if (hasConflict) {
            return false; // Venue is occupied
        }
    }

    return true; // Venue is available
}

/**
 * Check if two time slots overlap
 * @param {string} slot1Start - "HH:MM"
 * @param {string} slot1End - "HH:MM"
 * @param {string} slot2Start - "HH:MM"
 * @param {string} slot2End - "HH:MM"
 * @returns {boolean} - true if overlap, false otherwise
 */
function checkTimeSlotConflict(slot1Start, slot1End, slot2Start, slot2End) {
    // Convert to comparable numbers (minutes since midnight)
    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const start1 = toMinutes(slot1Start);
    const end1 = toMinutes(slot1End);
    const start2 = toMinutes(slot2Start);
    const end2 = toMinutes(slot2End);

    // Check overlap: start1 < end2 AND end1 > start2
    return start1 < end2 && end1 > start2;
}

/**
 * Filter venues by requirements
 * @param {array} venues - All venues
 * @param {object} requirements - Event requirements
 * @returns {array} - Filtered and sorted venues
 */
function filterVenuesByRequirements(venues, requirements) {
    const {
        date,
        startTime,
        durationHours,
        seatsRequired,
        facilitiesRequired,
    } = requirements;

    // Filter venues
    const filtered = venues.filter(venue => {
        // Check capacity
        if (venue.capacity < seatsRequired) return false;

        // Check if all required facilities are present
        const hasAllFacilities = facilitiesRequired.every(required =>
            venue.facilities.some(venueFacility =>
                venueFacility.toLowerCase().includes(required.toLowerCase()) ||
                required.toLowerCase().includes(venueFacility.toLowerCase())
            )
        );

        if (!hasAllFacilities) return false;

        // Check availability
        if (!isVenueAvailable(venue, date, startTime, durationHours)) return false;

        return true;
    });

    // Calculate match score for each venue
    const withScores = filtered.map(venue => ({
        ...venue,
        matchScore: calculateMatchScore(venue, facilitiesRequired, seatsRequired),
    }));

    // Sort by match score (descending), then capacity (ascending)
    withScores.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
        }
        return a.capacity - b.capacity; // Prefer smallest suitable venue
    });

    return withScores;
}

/**
 * Calculate match score for a venue
 * @param {object} venue - Venue document
 * @param {array} requiredFacilities - Required facilities
 * @param {number} requiredSeats - Required capacity
 * @returns {number} - Score from 0-100
 */
function calculateMatchScore(venue, requiredFacilities, requiredSeats) {
    let score = 0;

    // Facility match score (70% of total)
    const facilityScore = (requiredFacilities.length > 0)
        ? (requiredFacilities.filter(required =>
            venue.facilities.some(venueFacility =>
                venueFacility.toLowerCase().includes(required.toLowerCase())
            )
        ).length / requiredFacilities.length) * 70
        : 70;

    // Capacity match score (30% of total)
    // Prefer venues close to required capacity
    const capacityRatio = requiredSeats / venue.capacity;
    const capacityScore = capacityRatio >= 0.5 && capacityRatio <= 0.9
        ? 30 // Perfect range
        : capacityRatio >= 0.3 && capacityRatio < 0.5
            ? 25 // Good
            : 20; // Acceptable

    score = facilityScore + capacityScore;

    return Math.round(score);
}

module.exports = {
    isVenueAvailable,
    checkTimeSlotConflict,
    filterVenuesByRequirements,
    calculateMatchScore,
};
