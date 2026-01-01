const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../../functions/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

const db = admin.firestore();

async function checkEvents() {
    console.log('🔍 Checking approved_events collection...');

    try {
        const snapshot = await db.collection('approved_events').get();

        if (snapshot.empty) {
            console.log('❌ No documents found in approved_events!');
            return;
        }

        console.log(`✅ Found ${snapshot.size} approved events:`);

        snapshot.forEach(doc => {
            console.log(`----------------------------------------`);
            console.log(`ID: "${doc.id}"`);
            console.log(`Name: ${doc.data().eventName}`);
            console.log(`UserID: ${doc.data().userId}`);
        });

        console.log(`----------------------------------------`);
    } catch (error) {
        console.error('❌ Error reading Firestore:', error);
    }
}

checkEvents();
