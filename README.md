# TraceAR

TraceAR is a web-based Augmented Reality (AR) application that allows you to overlay images onto your camera feed for tracing and artistic reference.

## Features

- **Camera Overlay:** Overlay any image from your device onto your camera feed.
- **Adjustable Controls:** Scale, rotate, and change the opacity of the overlay image.
- **Filters:** Apply filters like Grayscale, Sepia, and Invert to the overlay.
- **Drawing Mode:** Draw directly on the screen to trace or annotate.
- **Lock Mode:** Lock the controls to prevent accidental changes while tracing.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/TraceAR.git
   cd TraceAR
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Android

This project uses Capacitor to build for Android.

1. Build the web app:
   ```bash
   npm run build
   ```

2. Sync with Capacitor:
   ```bash
   npx cap sync android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

4. Build the APK from Android Studio or using Gradle:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

## GitHub Actions

This repository includes a GitHub Actions workflow that automatically builds an APK on every push to the `main` branch. You can download the APK from the "Actions" tab in your GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
