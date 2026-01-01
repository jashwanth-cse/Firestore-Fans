/**
 * Quick Firestore Check Script
 * Run this to see what collections exist
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

async function checkCollections() {
    console.log('🔍 Checking Firestore Collections...\n');

    // List all collections
    const collections = await db.listCollections();

    console.log('📚 Available Collections:');
    collections.forEach(collection => {
        console.log(`  - ${collection.id}`);
    });

    console.log('\n📊 Checking specific collections:\n');

    // Check 'venues' collection
    const venuesSnapshot = await db.collection('venues').get();
    console.log(`✅ venues: ${venuesSnapshot.size} documents`);

    // Check 'event_venues' collection
    const eventVenuesSnapshot = await db.collection('event_venues').get();
    console.log(`✅ event_venues: ${eventVenuesSnapshot.size} documents`);

    // Check 'event_requests' collection
    const requestsSnapshot = await db.collection('event_requests').get();
    console.log(`✅ event_requests: ${requestsSnapshot.size} documents`);

    // Check 'approved_events' collection
    const approvedSnapshot = await db.collection('approved_events').get();
    console.log(`✅ approved_events: ${approvedSnapshot.size} documents`);

    console.log('\n💡 If "venues" shows 0 documents, you need to add sample data!');

    process.exit(0);
}

checkCollections().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
