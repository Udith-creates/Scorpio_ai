# Scorpio AI Frontend - Setup Guide

## Current Status
- Flutter project created in `frontend/` directory
- All feature code implemented (Dashboard, Heatmap, Alerts)
- Dependencies configured in `pubspec.yaml`
- Backend API endpoints added to `main.py`

## Known Issue: Firebase Web Compatibility
There's a known compatibility issue between `firebase_auth_web: 5.8.13` and Flutter 3.24.3. The error is:
```
Error: Type 'PromiseJsImpl' not found.
```

## Workaround Options

### Option 1: Use Flutter Version Manager (FVM)
```bash
# Install FVM
dart pub global activate fvm

# Use Flutter 3.16.9 (known to work with firebase packages)
fvm install 3.16.9
fvm use 3.16.9

# Now run the app
cd frontend
fvm flutter pub get
fvm flutter run -d chrome
```

### Option 2: Downgrade to Older Package Versions
In `pubspec.yaml`, use these exact versions:
```yaml
dependencies:
  firebase_core: 2.24.2
  firebase_auth: 4.14.0
  cloud_firestore: 4.13.0
  firebase_ui_auth: 1.6.0
```

Then run:
```bash
cd frontend
flutter clean
flutter pub get
flutter run -d chrome
```

### Option 3: Run on Android/iOS/Windows Instead
The web issue is specific to web. You can run on other platforms:
```bash
# Android (requires emulator or device)
flutter run -d android

# Windows (requires Developer Mode enabled)
flutter run -d windows

# iOS (requires macOS)
flutter run -d ios
```

## Firebase Setup Steps

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   # or
   winget install -e --id Google.FirebaseCLI
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Create Firebase Project:**
   ```bash
   firebase projects:create scorpio-ai-command-center --display-name "Scorpio AI Command Center"
   ```

4. **Initialize Firebase in frontend:**
   ```bash
   cd frontend
   firebase init firestore,auth --project scorpio-ai-command-center
   ```

5. **Configure FlutterFire:**
   ```bash
   dart pub global activate flutterfire_cli
   export PATH="$PATH:$HOME/.pub-cache/bin"  # On Windows, add to System PATH
   flutterfire configure --project=scorpio-ai-command-center
   ```

6. **Enable Services in Firebase Console:**
   - Go to https://console.firebase.google.com/
   - Select "scorpio-ai-command-center" project
   - Enable Authentication (Email/Password)
   - Create Firestore Database

## Running the App

### Backend (FastAPI):
```bash
cd C:\Users\arnav\Desktop\Scorpio_ai
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Flutter):
```bash
cd C:\Users\arnav\Desktop\Scorpio_ai\frontend
flutter run -d chrome
```

## Files Created

### Flutter App (`frontend/lib/`)
- `main.dart` - App entry point
- `app.dart` - GoRouter configuration
- `firebase_options.dart` - Firebase config (needs `flutterfire configure`)
- `core/constants/app_constants.dart` - App constants
- `core/theme/app_theme.dart` - Enterprise dark theme
- `core/services/firebase_service.dart` - Firebase initialization
- `core/services/firestore_service.dart` - Firestore operations
- `core/services/api_service.dart` - FastAPI client
- `features/auth/` - Login screen with Firebase UI
- `features/dashboard/` - Command Center dashboard
- `features/heatmap/` - Piracy geographic heatmap
- `features/alerts/` - Real-time piracy alerts
- `shared/widgets/` - Navigation rail, app shell

### Backend Updates (`main.py`)
- Added CORS middleware
- New endpoints: `/health`, `/api/v1/detections/report`, `/api/v1/detections/list`, `/api/v1/analytics/heatmap`, `/api/v1/dashboard/metrics`
- Firebase Admin SDK integration (optional)
- BigQuery integration (optional, with mock data fallback)

## Next Steps
1. Resolve the Firebase web compatibility issue (use Option 1, 2, or 3 above)
2. Run `flutterfire configure` to generate proper `firebase_options.dart`
3. Enable Firebase services in the console
4. Run backend and frontend
5. Test the full piracy detection workflow

## Screenshots of Expected UI
- **Dashboard**: Dark theme with metrics cards, recent detections list
- **Heatmap**: World map with colored circles showing piracy hotspots
- **Alerts**: List of all piracy alerts with red flashing banner
- **Login**: Firebase UI with Scorpio AI branding
