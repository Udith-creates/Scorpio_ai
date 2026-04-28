# Scorpio AI - Firebase Setup Script
# Run this script to complete Firebase setup

Write-Host "=== Scorpio AI Firebase Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Firebase Login
Write-Host "Step 1: Logging into Firebase..." -ForegroundColor Yellow
firebase login

# Step 2: Create Firebase Project (if not exists)
Write-Host ""
Write-Host "Step 2: Creating Firebase project..." -ForegroundColor Yellow
firebase projects:create scorpio-ai-command-center --display-name "Scorpio AI Command Center"

# Step 3: Initialize Firebase in frontend directory
Write-Host ""
Write-Host "Step 3: Initializing Firebase in frontend directory..." -ForegroundColor Yellow
Set-Location -Path ".\frontend"
firebase init firestore,auth,hosting --project scorpio-ai-command-center

# Step 4: Configure FlutterFire
Write-Host ""
Write-Host "Step 4: Configuring FlutterFire..." -ForegroundColor Yellow
$env:Path += ";C:\Users\arnav\AppData\Local\Pub\Cache\bin"
flutterfire configure --project=scorpio-ai-command-center --platforms=android,ios,web --yes

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1. Update frontend/lib/firebase_options.dart with your actual Firebase config values"
Write-Host "2. Enable Authentication (Email/Password) in Firebase Console"
Write-Host "3. Create Firestore database in Firebase Console"
Write-Host "4. Run: cd frontend && flutter run"
