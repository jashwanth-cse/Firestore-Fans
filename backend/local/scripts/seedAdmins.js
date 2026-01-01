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

// Admin users data
const admins = [
    { email: 'admin1@sece.ac.in', name: 'Admin One', role: 'admin' },
    { email: 'admin2@sece.ac.in', name: 'Admin Two', role: 'admin' },
    { email: 'admin3@sece.ac.in', name: 'Admin Three', role: 'admin' },
    { email: 'admin4@sece.ac.in', name: 'Admin Four', role: 'admin' },
    { email: 'admin5@sece.ac.in', name: 'Admin Five', role: 'admin' },
    { email: 'admin6@sece.ac.in', name: 'Admin Six', role: 'admin' },
    { email: 'admin7@sece.ac.in', name: 'Admin Seven', role: 'admin' },
    { email: 'admin8@sece.ac.in', name: 'Admin Eight', role: 'admin' },
    { email: 'admin9@sece.ac.in', name: 'Admin Nine', role: 'admin' },
    { email: 'admin10@sece.ac.in', name: 'Admin Ten', role: 'admin' },
];

const DEFAULT_PASSWORD = 'Admin@123';

async function seedAdmins() {
    try {
        console.log('🌱 Seeding admin users...\n');
        console.log('⚠️  Default password for all admins: Admin@123\n');

        for (const adminData of admins) {
            try {
                // Check if user already exists in Firebase Auth
                let user;
                try {
                    user = await admin.auth().getUserByEmail(adminData.email);
                    console.log(`ℹ️  User ${adminData.email} already exists in Auth`);
                } catch (error) {
                    // User doesn't exist, create it
                    user = await admin.auth().createUser({
                        email: adminData.email,
                        password: DEFAULT_PASSWORD,
                        displayName: adminData.name,
                        emailVerified: true,
                    });
                    console.log(`✓ Created Auth user: ${adminData.email}`);
                }

                // Create/update Firestore document
                await db.collection('users').doc(user.uid).set({
                    email: adminData.email,
                    name: adminData.name,
                    role: adminData.role,
                    isHosteler: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });

                console.log(`✓ Created Firestore doc: ${adminData.name}\n`);
            } catch (error) {
                console.error(`❌ Error creating ${adminData.email}:`, error.message);
            }
        }

        console.log(`\n✅ Successfully processed ${admins.length} admin users!`);
        console.log('📝 Collection: users (with role: admin)');
        console.log('\n📋 Admin Credentials:');
        admins.forEach(admin => {
            console.log(`   Email: ${admin.email} | Password: ${DEFAULT_PASSWORD}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admins:', error);
        process.exit(1);
    }
}

// Run the seed function
seedAdmins();
