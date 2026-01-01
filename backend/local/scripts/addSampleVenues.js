/**
 * Add Sample Venues to Firestore
 * Run this to populate your venues collection
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../functions/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleVenues = [
    {
        name: 'Main Auditorium',
        type: 'auditorium',
        capacity: 500,
        facilities: ['Projector', 'Air Conditioning', 'Audio System', 'Stage Lighting'],
        building: 'Central Block',
        floor: 1,
        isActive: true
    },
    {
        name: 'Seminar Hall',
        type: 'seminar_hall',
        capacity: 200,
        facilities: ['Projector', 'Air Conditioning', 'WiFi', 'Audio System'],
        building: 'Admin Block',
        floor: 2,
        isActive: true
    },
    {
        name: 'Computer Lab 1',
        type: 'lab',
        capacity: 60,
        facilities: ['Computers', 'Projector', 'Air Conditioning', 'Lab Equipment'],
        building: 'CSE Block',
        floor: 2,
        isActive: true
    },
    {
        name: 'Computer Lab 2',
        type: 'lab',
        capacity: 80,
        facilities: ['Computers', 'Projector', 'Air Conditioning', 'Lab Equipment'],
        building: 'CSE Block',
        floor: 3,
        isActive: true
    },
    {
        name: 'Conference Room',
        type: 'meeting_room',
        capacity: 50,
        facilities: ['Whiteboard', 'Air Conditioning', 'Video Conferencing', 'WiFi'],
        building: 'Admin Block',
        floor: 3,
        isActive: true
    },
    {
        name: 'Open Air Theater',
        type: 'outdoor',
        capacity: 300,
        facilities: ['Audio System'],
        building: 'Campus Grounds',
        floor: null,
        isActive: true
    }
];

async function addSampleVenues() {
    console.log('🚀 Adding sample venues to Firestore...\n');

    const batch = db.batch();

    sampleVenues.forEach((venue, index) => {
        const venueRef = db.collection('venues').doc();
        batch.set(venueRef, venue);
        console.log(`✅ Queued: ${venue.name}`);
    });

    await batch.commit();

    console.log(`\n✅ Successfully added ${sampleVenues.length} venues!`);
    console.log('\n🎉 You can now test the API again in Postman!');

    process.exit(0);
}

addSampleVenues().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
