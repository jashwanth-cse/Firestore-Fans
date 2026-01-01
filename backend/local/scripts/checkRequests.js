const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../../functions/serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function checkRequests() {
    console.log('Checking recent event requests...');
    const snapshot = await db.collection('event_requests')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

    if (snapshot.empty) {
        console.log('No requests found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\nID: ${doc.id}`);
        console.log(`Event: ${data.eventName}`);
        console.log(`Venue: ${data.venueName}`);
        console.log(`Status: ${data.status}`);
        console.log(`Created: ${data.createdAt?.toDate()}`);
        console.log('---');
    });
}

checkRequests().then(() => process.exit());
