# TraceAR

TraceAR is a web-based augmented reality tool for tracing images. It allows users to upload an image from their gallery, overlay it on their camera feed, adjust transparency, size, and rotation, and trace the image onto paper.

## Features

- **Camera Integration**: Access device camera (front/back).
- **Image Overlay**: Upload and overlay images.
- **Adjustable Controls**: Opacity, Scale, Rotation.
- **Filters**: Grayscale, Sepia, Invert.
- **Drawing Tools**: Freehand drawing on screen.
- **Lock Mode**: Lock controls for uninterrupted tracing.

## How to Build for Mobile (APK / iOS)

To convert this web application into a native mobile app (APK for Android or IPA for iOS), we recommend using **Capacitor**.

### Prerequisites

- **Node.js** installed on your computer.
- **Android Studio** (for Android app).
- **Xcode** (for iOS app, requires macOS).

### Steps

1.  **Build the Web App**
    First, generate the static files for your application.
    ```bash
    npm run build
    ```
    This will create a `dist` folder with your compiled app.

2.  **Install Capacitor**
    Install the Capacitor CLI and core packages.
    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
    ```

3.  **Initialize Capacitor**
    Initialize the Capacitor config.
    ```bash
    npx cap init TraceAR com.example.tracear --web-dir dist
    ```
    *Note: You can replace `com.example.tracear` with your own unique bundle ID.*

4.  **Add Platforms**
    Add the Android and iOS platforms.
    ```bash
    npx cap add android
    npx cap add ios
    ```

5.  **Sync Project**
    Sync your web code to the native projects.
    ```bash
    npx cap sync
    ```

6.  **Build and Run**

    **For Android:**
    ```bash
    npx cap open android
    ```
    - This opens Android Studio.
    - Wait for Gradle sync to finish.
    - Connect your Android device or use an emulator.
    - Click the "Run" button (green play icon) to install the app.
    - To build an APK: Go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

    **For iOS (Mac only):**
    ```bash
    npx cap open ios
    ```
    - This opens Xcode.
    - Connect your iOS device.
    - Select your Team in the project settings (Signing & Capabilities).
    - Click the "Run" button (play icon) to install on your device.

### Updating the App
If you make changes to your web code (React components, CSS, etc.), run these commands to update the mobile apps:

```bash
npm run build
npx cap sync
```
Then re-run from Android Studio or Xcode.
