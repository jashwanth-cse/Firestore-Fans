const admin = require('firebase-admin');
const getDb = () => admin.firestore();

/**
 * Venue Controller
 */

/**
 * GET /api/venues/all
 * Get all venues with proper frontend format
 */
async function getAllVenues(req, res) {
    try {
        console.log('📍 Fetching all venues from Firestore');

        // Query 'event_venues' collection (user confirmed this is the correct name)
        const snapshot = await getDb().collection('event_venues').get();

        if (snapshot.empty) {
            return res.json({
                success: true,
                venues: [],
                count: 0,
                message: 'No venues found in event_venues collection'
            });
        }

        const venues = [];

        snapshot.forEach(doc => {
            const venueData = doc.data();

            // Transform occupancy object to occupiedTimes array
            const occupiedTimes = [];
            if (venueData.occupancy) {
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
            venues.push({
                id: doc.id,
                venueId: doc.id,
                name: venueData.name,
                type: venueData.type,
                capacity: venueData.capacity,
                facilities: venueData.facilities || [],
                isAvailable: occupiedTimes.length === 0, // Available if no occupied times
                occupiedTimes, // Array of occupied time slots
                building: venueData.building,
                floor: venueData.floor,
            });
        });

        console.log(`✅ Found ${venues.length} venues`);

        res.json({
            success: true,
            venues,
            count: venues.length,
        });
    } catch (error) {
        console.error('Get all venues error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}

module.exports = {
    getAllVenues,
};
