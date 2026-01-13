# Generate Android Release Keystore
# Run this script in PowerShell to create a production keystore for signing your app

Write-Host "🔐 Generating Android Release Keystore..." -ForegroundColor Cyan
Write-Host ""

# Keystore configuration
$KEYSTORE_FILE = "nexsync-release.keystore"
$KEY_ALIAS = "nexsync-key"
$VALIDITY_DAYS = 10000

Write-Host "This will generate:" -ForegroundColor Yellow
Write-Host "  - Keystore file: $KEYSTORE_FILE"
Write-Host "  - Key alias: $KEY_ALIAS"
Write-Host "  - Validity: $VALIDITY_DAYS days"
Write-Host ""

# Generate keystore
keytool -genkeypair `
  -v `
  -storetype PKCS12 `
  -keystore "$KEYSTORE_FILE" `
  -alias "$KEY_ALIAS" `
  -keyalg RSA `
  -keysize 2048 `
  -validity "$VALIDITY_DAYS"

Write-Host ""
Write-Host "✅ Keystore generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT SECURITY STEPS:" -ForegroundColor Red
Write-Host "1. Move $KEYSTORE_FILE to android/app/"
Write-Host "2. NEVER commit this file to git"
Write-Host "3. Keep the password in a secure password manager"
Write-Host "4. Make a backup of the keystore file"
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Add keystore details to android/gradle.properties"
Write-Host "2. Update android/app/build.gradle signing configuration"
Write-Host ""
Write-Host "Example gradle.properties entries:" -ForegroundColor Cyan
Write-Host "NEXSYNC_RELEASE_STORE_FILE=nexsync-release.keystore"
Write-Host "NEXSYNC_RELEASE_KEY_ALIAS=nexsync-key"
Write-Host "NEXSYNC_RELEASE_STORE_PASSWORD=your_password_here"
Write-Host "NEXSYNC_RELEASE_KEY_PASSWORD=your_password_here"
Write-Host ""
