# 📱 Flutter Mobile Application (Android & iOS)

A professional cross-platform mobile application built with **Flutter**, **Dart**, and **FastAPI Backend** for Business Card OCR scanning, contact management, and role categorization.

---

## 🌟 Key Features

1. **Camera & Gallery Business Card Scanner**:
   - Snap card photos using the phone's Camera or choose existing card photos from the Gallery.
   - Real-time OCR processing via Roboflow API.

2. **Defensive Duplicate Detection**:
   - Interactive alert banner if a business card is already registered in the system.

3. **Role Categorization & Grouping**:
   - Filter contacts by Role (`Executive`, `Engineering`, `Management`, `Sales & Marketing`, `Product & Design`, `Operations & Admin`, `General`).
   - Grouped Role Categories View.

4. **Quick Action Direct Launchers**:
   - Tap Phone number to dial immediately.
   - Tap Email to open mail app.
   - Tap Website to view company site.

---

## 🚀 Running the App Locally

### Prerequisites

1. **Flutter SDK** (Version 3.13+)
2. **Android Studio** or **VS Code** with Flutter & Dart extensions.
3. Backend Server Running (`uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`).

### Step-by-Step Setup

1. Navigate to the `mobile_app` folder:
   ```bash
   cd mobile_app
   ```

2. Fetch dependencies:
   ```bash
   flutter pub get
   ```

3. Run on Android Emulator or Connected Device:
   ```bash
   flutter run
   ```

---

## 🌐 API Endpoint Configuration

By default, the Flutter app detects the environment:
- **Android Emulator**: Connects to `http://10.0.2.2:8000` (Android's special alias for host localhost).
- **iOS Simulator / Desktop**: Connects to `http://localhost:8000`.
- **Production VPS**: To connect to your live VPS backend, update `_overrideBaseUrl` in `lib/services/api_service.dart`:
  ```dart
  ApiService.setBaseUrl('http://YOUR_VPS_IP');
  ```

---

## 📦 Building Android APK / App Bundle

To generate a debug APK:
```bash
flutter build apk --debug
```

To generate an optimized release APK:
```bash
flutter build apk --release
```

The compiled `.apk` file will be located at:
`mobile_app/build/app/outputs/flutter-apk/app-release.apk`
