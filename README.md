# Ella Rayne - Gemini OS

> Love me Love me Say that you love  
> fool me fool me I cant love anyone but

## 🚀 About

A React-based AI-powered operating system interface built with Firebase, TypeScript, and Tailwind CSS. Features include AI chat, file management, terminal simulation, and GitHub integration.

## 📋 Prerequisites

### Web Development
- Node.js >= 18.0.0
- npm >= 9.0.0

### Android Development (Optional)
- [Android Studio](https://developer.android.com/studio) (latest version recommended)
- JDK 17 or higher
- Android SDK with:
  - Android SDK Platform 34 (Android 14)
  - Android SDK Build-Tools 34.0.0 or higher
  - Android SDK Platform-Tools
  - Android SDK Command-line Tools

## 🛠️ Setup

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production (Web)

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Build for Android

```bash
# 1. Build the web assets
npm run build

# 2. Sync web assets to Android
npm run cap:sync:android

# 3. Open in Android Studio
npm run open:android

# Or use the combined command:
npm run build:android
```

## 📱 Android Development

### Initial Android Setup

After cloning the repository, the Android platform is already configured. To get started:

1. **Install Android Studio** - Download from [developer.android.com/studio](https://developer.android.com/studio)

2. **Install Required SDK Components** - Open Android Studio and install:
   - Android SDK Platform 34 (Android 14)
   - Android SDK Build-Tools 34.0.0+
   - Android Emulator (for testing)

3. **Sync Project** - Run the following to sync web assets to Android:
   ```bash
   npm run build:android
   ```

4. **Open in Android Studio**:
   ```bash
   npm run open:android
   ```

### Building APK

#### Debug APK
1. Open the project in Android Studio (`npm run open:android`)
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Once built, click **locate** to find the APK in `android/app/build/outputs/apk/debug/`

#### Release APK (Signed)
1. Generate a keystore (one-time setup):
   ```bash
   keytool -genkey -v -keystore ella-rayne-release.keystore -alias ella-rayne -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Create `android/keystore.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=ella-rayne
   storeFile=../ella-rayne-release.keystore
   ```

3. Update `android/app/build.gradle` to use the keystore (for signing)

4. In Android Studio:
   - Go to **Build** → **Generate Signed Bundle / APK**
   - Select **APK**
   - Choose your keystore and provide credentials
   - Select **release** build variant
   - Click **Finish**

5. Find the signed APK in `android/app/release/`

### Running on Android Emulator

1. Create an emulator in Android Studio (Tools → Device Manager)
2. Start the emulator
3. In Android Studio, click **Run** (green play button) or press Shift+F10
4. Select your emulator from the device list

### Running on Physical Device

1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap **Build Number** 7 times
   
2. Enable **USB Debugging**:
   - Go to Settings → Developer Options
   - Enable **USB Debugging**

3. Connect your device via USB

4. In Android Studio, click **Run** and select your device

### Syncing Changes

After making changes to the web app, sync them to Android:

```bash
# Rebuild web assets and sync
npm run build:android

# Or manually:
npm run build
npm run cap:sync:android
```

### Android Troubleshooting

#### Gradle Build Fails
- **Solution**: Make sure you have JDK 17+ installed
- Verify with: `java -version`
- Set JAVA_HOME if needed

#### SDK Not Found
- **Solution**: Open Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK
- Install missing SDK components

#### App Won't Launch on Device
- **Solution**: Check that USB debugging is enabled
- Try revoking and re-authorizing USB debugging permissions
- Check `adb devices` to see if device is connected

#### White Screen on Android
- **Solution**: Clear app data and cache
- Rebuild the web assets: `npm run build`
- Sync again: `npm run cap:sync:android`

#### Plugin Errors
- **Solution**: Make sure all Capacitor plugins are installed:
  ```bash
  npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard @capacitor/network
  ```

## 🔧 Development

### Available Scripts

#### Web Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

#### Android/Capacitor
- `npm run cap:sync` - Sync web assets to all platforms
- `npm run cap:sync:android` - Sync web assets to Android only
- `npm run cap:open:android` - Open project in Android Studio
- `npm run build:android` - Build web assets and sync to Android
- `npm run open:android` - Open Android Studio

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **GitHub Actions** for CI/CD

### Linting & Formatting

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check if code is formatted
npm run format:check
```

## 🏗️ Project Structure

```
ella-rayne/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles with Tailwind
│   └── assets/          # Static assets
├── android/             # Native Android project (Capacitor)
│   ├── app/            # Android app module
│   │   ├── src/       # Android source files
│   │   └── build.gradle
│   ├── gradle/         # Gradle wrapper
│   ├── build.gradle    # Root build configuration
│   └── variables.gradle # Android SDK versions & dependencies
├── .github/
│   └── workflows/       # CI/CD workflows
│       ├── ci.yml              # Main CI/CD pipeline
│       ├── dependency-review.yml  # Dependency security check
│       └── deploy.yml          # GitHub Pages deployment
├── dist/               # Built web assets (generated)
├── index.html           # HTML template
├── capacitor.config.ts  # Capacitor configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── package.json         # Project dependencies
```

## 🔒 Security

- **CodeQL** security scanning enabled in CI/CD
- **Dependency Review** on pull requests
- **npm audit** runs on every build
- Regular security updates via Dependabot (recommended to enable)

## 🚀 CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

### Main CI/CD Pipeline (`ci.yml`)
- ✅ Code linting with ESLint
- ✅ Code formatting check with Prettier
- ✅ TypeScript type checking
- ✅ Production build
- ✅ Security scanning with CodeQL
- ✅ npm audit for vulnerabilities

### Dependency Review (`dependency-review.yml`)
- 🔍 Automatic dependency vulnerability scanning on PRs
- ⚠️ Alerts for security issues in dependencies

### Deployment (`deploy.yml`)
- 🌐 Automatic deployment to GitHub Pages on main branch push

## 🔐 Environment Variables

This project uses Firebase. Set up your Firebase config:

1. Create a `.env` file (gitignored)
2. Add your Firebase configuration
3. Or use Canvas environment variables

## 📦 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Backend services
- **Lucide React** - Icon library

### Mobile
- **Capacitor** - Native mobile runtime
- **Android Platform** - Native Android support
- **Capacitor Plugins**:
  - Status Bar - Status bar customization
  - Splash Screen - Launch screen management
  - Keyboard - Keyboard handling
  - Network - Network status detection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality Standards

- All code must pass ESLint checks
- Code must be formatted with Prettier
- TypeScript strict mode must pass
- All CI/CD checks must pass

## 📄 License

This project is private.

## 🎵 Inspiration

> Love me Love me Say that you love  
> fool me fool me I cant love anyone but

---

**Made with ❤️ using React, TypeScript, and Firebase**
