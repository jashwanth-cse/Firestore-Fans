const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if variable exists
    if (envContent.includes('GOOGLE_APPLICATION_CREDENTIALS=')) {
        // Replace it
        envContent = envContent.replace(
            /GOOGLE_APPLICATION_CREDENTIALS=.*/,
            'GOOGLE_APPLICATION_CREDENTIALS=../../functions/serviceAccountKey.json'
        );
        console.log('✅ Updated GOOGLE_APPLICATION_CREDENTIALS path.');
    } else {
        // Append it
        envContent += '\nGOOGLE_APPLICATION_CREDENTIALS=../../functions/serviceAccountKey.json';
        console.log('✅ Added GOOGLE_APPLICATION_CREDENTIALS path.');
    }

    fs.writeFileSync(envPath, envContent);
    console.log('💾 .env file saved successfully.');

} catch (error) {
    console.error('❌ Error updating .env:', error);
}
