/**
 * Check event_venues Schema
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../functions/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkSchema() {
    console.log('🔍 Checking event_venues schema...\n');

    const snapshot = await db.collection('event_venues').limit(1).get();

    if (snapshot.empty) {
        console.log('❌ Collection event_venues is empty!');
    } else {
        snapshot.forEach(doc => {
            console.log('📄 Document ID:', doc.id);
            console.log('📦 Data:', JSON.stringify(doc.data(), null, 2));
        });
    }

    process.exit(0);
}

checkSchema().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
