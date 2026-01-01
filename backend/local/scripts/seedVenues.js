require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin - resolve path from project root
const serviceAccountPath = path.resolve(__dirname, '../../functions/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// Venue data
const venues = [
    {
        name: 'Main Auditorium',
        building: 'Admin Block',
        floor: 1,
        capacity: 500,
        facilities: ['Projector', 'Air Conditioning', 'Audio System'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Computer Lab 1',
        building: 'CSE Block',
        floor: 2,
        capacity: 60,
        facilities: ['Computers', 'Air Conditioning', 'Projector'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Computer Lab 2',
        building: 'CSE Block',
        floor: 3,
        capacity: 80,
        facilities: ['Computers', 'Air Conditioning', 'Projector', 'Lab Equipment'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Seminar Hall A',
        building: 'Admin Block',
        floor: 2,
        capacity: 200,
        facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Audio System'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Seminar Hall B',
        building: 'Main Block',
        floor: 1,
        capacity: 150,
        facilities: ['Projector', 'Air Conditioning', 'Whiteboard'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Conference Room',
        building: 'Admin Block',
        floor: 3,
        capacity: 50,
        facilities: ['Whiteboard', 'Air Conditioning', 'Video Conferencing', 'WiFi'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Open Air Theater',
        building: 'Campus Grounds',
        floor: 0,
        capacity: 300,
        facilities: ['Audio System'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Workshop Hall',
        building: 'Mechanical Block',
        floor: 1,
        capacity: 100,
        facilities: ['Projector', 'Air Conditioning', 'Lab Equipment'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Tutorial Room 1',
        building: 'CSE Block',
        floor: 1,
        capacity: 30,
        facilities: ['Whiteboard', 'Projector'],
        occupiedSlots: [],
        isActive: true,
    },
    {
        name: 'Tutorial Room 2',
        building: 'CSE Block',
        floor: 1,
        capacity: 30,
        facilities: ['Whiteboard', 'Projector'],
        occupiedSlots: [],
        isActive: true,
    },
];

async function seedVenues() {
    try {
        console.log('🌱 Seeding venues...\n');

        const batch = db.batch();

        venues.forEach((venue) => {
            const docRef = db.collection('event_venues').doc();
            batch.set(docRef, {
                ...venue,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`✓ ${venue.name} (${venue.capacity} seats)`);
        });

        await batch.commit();

        console.log(`\n✅ Successfully created ${venues.length} venues!`);
        console.log('📝 Collection: event_venues');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding venues:', error);
        process.exit(1);
    }
}

// Run the seed function
seedVenues();
