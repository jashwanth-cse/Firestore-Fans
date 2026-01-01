import * as admin from 'firebase-admin';

/**
 * Get all venues with their current occupancy status
 * Used for browsing available venues
 */
const db = admin.firestore();

export async function getAllVenues(): Promise<any[]> {
    const venuesSnapshot = await db.collection('venues').get();

    const allVenues: any[] = [];

    for (const venueDoc of venuesSnapshot.docs) {
        const venueData = venueDoc.data();

        // Transform occupancy to occupiedTimes array
        const occupiedTimes: any[] = [];
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

        // Return in frontend format
        allVenues.push({
            id: venueDoc.id,
            venueId: venueDoc.id,
            name: venueData.name,
            type: venueData.type,
            capacity: venueData.capacity,
            facilities: venueData.facilities || [],
            isAvailable: occupiedTimes.length === 0, // Available if no occupied times
            occupiedTimes,
            building: venueData.building,
            floor: venueData.floor,
        });
    }

    return allVenues;
}
