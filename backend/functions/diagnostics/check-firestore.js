/**
 * Firestore Diagnostic Script
 * Checks all EventSync collections and verifies data structure
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials or service account)
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function checkFirestoreData() {
    console.log('🔍 FIRESTORE DIAGNOSTIC REPORT');
    console.log('='.repeat(80));
    console.log('Timestamp:', new Date().toISOString());
    console.log('='.repeat(80));
    console.log('\n');

    // 1. Check Venues Collection
    console.log('📍 CHECKING VENUES COLLECTION');
    console.log('-'.repeat(80));

    try {
        const venuesSnapshot = await db.collection('venues').get();

        if (venuesSnapshot.empty) {
            console.log('⚠️  WARNING: Venues collection is EMPTY!');
            console.log('   You need to add venue documents to Firestore.');
        } else {
            console.log(`✅ Found ${venuesSnapshot.size} venue(s)\n`);

            venuesSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`Venue ${index + 1}:`);
                console.log(`  ID: ${doc.id}`);
                console.log(`  Name: ${data.name || 'MISSING'}`);
                console.log(`  Type: ${data.type || 'MISSING'}`);
                console.log(`  Capacity: ${data.capacity || 'MISSING'}`);
                console.log(`  Facilities: ${JSON.stringify(data.facilities || [])}`);

                // Check occupancy structure
                if (data.occupancy) {
                    console.log(`  Occupancy: EXISTS`);
                    const dates = Object.keys(data.occupancy);
                    console.log(`    Dates with bookings: ${dates.length > 0 ? dates.join(', ') : 'NONE'}`);

                    // Show occupancy details
                    dates.forEach(date => {
                        const timeSlots = data.occupancy[date];
                        console.log(`    📅 ${date}:`);
                        Object.keys(timeSlots).forEach(slot => {
                            console.log(`      ⏰ ${slot}: ${timeSlots[slot] ? '🔴 OCCUPIED' : '🟢 AVAILABLE'}`);
                        });
                    });
                } else {
                    console.log(`  Occupancy: NOT SET (all times available)`);
                }

                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ ERROR checking venues:', error.message);
    }

    console.log('\n');

    // 2. Check Event Requests Collection
    console.log('📋 CHECKING EVENT_REQUESTS COLLECTION (Pending)');
    console.log('-'.repeat(80));

    try {
        const requestsSnapshot = await db.collection('event_requests').get();

        if (requestsSnapshot.empty) {
            console.log('ℹ️  No pending requests');
        } else {
            console.log(`✅ Found ${requestsSnapshot.size} pending request(s)\n`);

            requestsSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`Request ${index + 1}:`);
                console.log(`  ID: ${doc.id}`);
                console.log(`  Event Name: ${data.eventName || 'MISSING'}`);
                console.log(`  User ID: ${data.userId || 'MISSING'}`);
                console.log(`  Date: ${data.date || 'MISSING'}`);
                console.log(`  Start Time: ${data.startTime || 'MISSING'}`);
                console.log(`  Duration Hours: ${data.durationHours || 'MISSING'}`);
                console.log(`  Venue ID: ${data.venueId || 'MISSING'}`);
                console.log(`  Venue Name: ${data.venueName || 'MISSING'}`);
                console.log(`  Status: ${data.status || 'MISSING'}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ ERROR checking event_requests:', error.message);
    }

    console.log('\n');

    // 3. Check Approved Events Collection
    console.log('✅ CHECKING APPROVED_EVENTS COLLECTION');
    console.log('-'.repeat(80));

    try {
        const approvedSnapshot = await db.collection('approved_events').get();

        if (approvedSnapshot.empty) {
            console.log('ℹ️  No approved events');
        } else {
            console.log(`✅ Found ${approvedSnapshot.size} approved event(s)\n`);

            approvedSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`Event ${index + 1}:`);
                console.log(`  ID: ${doc.id}`);
                console.log(`  Event Name: ${data.eventName || 'MISSING'}`);
                console.log(`  Date: ${data.date || 'MISSING'}`);
                console.log(`  Venue: ${data.venueName || 'MISSING'} (${data.venueId || 'MISSING'})`);
                console.log(`  Approved By: ${data.approvedBy || 'MISSING'}`);
                console.log(`  Calendar Synced: ${data.calendarEventId ? 'YES' : 'NO'}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('❌ ERROR checking approved_events:', error.message);
    }

    console.log('\n');

    // 4. Data Structure Validation
    console.log('🔬 DATA STRUCTURE VALIDATION');
    console.log('-'.repeat(80));

    const venuesSnapshot = await db.collection('venues').get();
    let hasStructureIssues = false;

    venuesSnapshot.forEach(doc => {
        const data = doc.data();
        const issues = [];

        if (!data.name) issues.push('Missing "name"');
        if (!data.type) issues.push('Missing "type"');
        if (typeof data.capacity !== 'number') issues.push('Missing/invalid "capacity"');
        if (!Array.isArray(data.facilities)) issues.push('Missing/invalid "facilities"');

        if (issues.length > 0) {
            hasStructureIssues = true;
            console.log(`⚠️  Venue "${doc.id}" has issues:`);
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
    });

    if (!hasStructureIssues) {
        console.log('✅ All venues have correct structure');
    }

    console.log('\n');

    // 5. Summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Venues: ${venuesSnapshot.size}`);

    const requestsSnapshot = await db.collection('event_requests').get();
    const approvedSnapshot = await db.collection('approved_events').get();

    console.log(`Pending Requests: ${requestsSnapshot.size}`);
    console.log(`Approved Events: ${approvedSnapshot.size}`);

    // Count occupied slots
    let totalOccupiedSlots = 0;
    venuesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.occupancy) {
            Object.values(data.occupancy).forEach(dateSlots => {
                Object.values(dateSlots).forEach(isOccupied => {
                    if (isOccupied) totalOccupiedSlots++;
                });
            });
        }
    });

    console.log(`Total Occupied Time Slots: ${totalOccupiedSlots}`);
    console.log('='.repeat(80));

    console.log('\n✅ Diagnostic complete!');

    process.exit(0);
}

// Run the diagnostic
checkFirestoreData().catch(error => {
    console.error('💥 FATAL ERROR:', error);
    process.exit(1);
});
