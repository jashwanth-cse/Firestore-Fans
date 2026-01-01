require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const admin = require('firebase-admin');
const path = require('path');

console.log('🚀 Seeding Venues for Sample Prompts...');

// Initialize Firebase Admin
try {
    const serviceAccountPath = path.resolve(__dirname, '../../functions/serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    }
} catch (error) {
    console.error('❌ Failed to init Firebase:', error.message);
    process.exit(1);
}

const db = admin.firestore();

// 1. Matches "need a lab for 60 students with computers"
// 2. Matches "Book the auditorium ... for 4 hours"
// 3. Matches "seminar hall with projector for 100 people"

const specificVenues = [
    {
        name: 'Innovation Tech Lab',
        building: 'Tech Park',
        floor: 1,
        capacity: 80,
        facilities: ['Computers', 'Air Conditioning', 'Projector', 'Whiteboard', 'WiFi'],
        type: 'lab',
        isActive: true,
        // Empty occupied slots to ensure availability
        occupiedSlots: []
    },
    {
        name: 'Grand Convocation Hall',
        building: 'Main Block',
        floor: 0,
        capacity: 1200,
        facilities: ['Audio System', 'Projector', 'Air Conditioning', 'Stage', 'Lighting'],
        type: 'auditorium',
        isActive: true,
        occupiedSlots: []
    },
    {
        name: 'Executive Seminar Hall A',
        building: 'MBA Block',
        floor: 2,
        capacity: 150,
        facilities: ['Projector', 'WiFi', 'Air Conditioning', 'Video Conferencing'],
        type: 'hall',
        isActive: true,
        occupiedSlots: []
    }
];

async function seedSpecificVenues() {
    try {
        const batch = db.batch();
        const collectionRef = db.collection('event_venues'); // Ensure matching actual collection name

        for (const venue of specificVenues) {
            // Create a deterministic ID based on name to avoid duplicates if run multiple times
            const docId = venue.name.toLowerCase().replace(/\s+/g, '_');
            const docRef = collectionRef.doc(docId);

            batch.set(docRef, {
                ...venue,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // Merge to update if exists

            console.log(`📦 Prepared: ${venue.name}`);
        }

        await batch.commit();
        console.log('✅ Successfully seeded 3 specific venues for sample prompts!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding venues:', error);
        process.exit(1);
    }
}

seedSpecificVenues();
