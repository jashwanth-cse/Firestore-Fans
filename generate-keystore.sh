#!/bin/bash

# Generate Android Release Keystore
# Run this script to create a production keystore for signing your app

echo "🔐 Generating Android Release Keystore..."
echo ""

# Keystore configuration
KEYSTORE_FILE="nexsync-release.keystore"
KEY_ALIAS="nexsync-key"
VALIDITY_DAYS=10000

echo "This will generate:"
echo "  - Keystore file: $KEYSTORE_FILE"
echo "  - Key alias: $KEY_ALIAS"
echo "  - Validity: $VALIDITY_DAYS days"
echo ""

# Generate keystore
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY_DAYS"

echo ""
echo "✅ Keystore generated successfully!"
echo ""
echo "⚠️  IMPORTANT SECURITY STEPS:"
echo "1. Move $KEYSTORE_FILE to a secure location"
echo "2. NEVER commit this file to git"
echo "3. Keep the password in a secure password manager"
echo "4. Make a backup of the keystore file"
echo ""
echo "📝 Next steps:"
echo "1. Update android/gradle.properties with keystore details"
echo "2. Update android/app/build.gradle signing configuration"
echo ""
