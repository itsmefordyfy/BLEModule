# BLE Module for React Native

A React Native native module for scanning Bluetooth Low Energy (BLE) peripherals on iOS and Android.

## Features

- Start and stop BLE peripheral scanning
- Receive real-time notifications for scan events
- Retrieve detailed information about discovered peripherals:
  - Unique identifier (UUID)
  - Device name
  - Signal strength (RSSI)
  - Advertisement data
- Clean TypeScript interface with event-driven architecture
- Efficient data management using object-oriented design

## Installation

1. Clone or download this project.
2. Install dependencies:
   ```sh
   npm install
   ```

3. For iOS, install CocoaPods:
   ```sh
   cd ios
   bundle install
   bundle exec pod install
   ```

## Permissions

### Android

The module requires the following permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
```

Runtime permissions for location and Bluetooth need to be requested in your app.

### iOS

The module requires the following permissions in `ios/BLEModule/Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to scan for nearby BLE devices.</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app uses Bluetooth to connect to BLE peripherals.</string>
```

## Usage

### Basic Usage

```typescript
import { BLEManager, BLEPeripheral } from './src/BLEModule';

const bleManager = new BLEManager();

// Listen for scan events
bleManager.onScanStart(() => {
  console.log('Scan started');
});

bleManager.onScanEnd(() => {
  console.log('Scan ended');
});

bleManager.onPeripheralDiscovered((peripheral: BLEPeripheral) => {
  console.log('Discovered peripheral:', peripheral);
});

// Start scanning
await bleManager.startScan();

// Stop scanning
await bleManager.stopScan();

// Check scanning status
const isScanning = await bleManager.isScanning();

// Clean up listeners
bleManager.removeAllListeners();
```

### Peripheral Data Structure

```typescript
interface BLEPeripheral {
  id: string;              // Unique identifier (UUID)
  name?: string;           // Device name (may be undefined)
  rssi: number;            // Signal strength in dBm
  advertisementData?: {    // Additional advertisement data
    [key: string]: any;
  };
}
```

## Integration into Existing Apps

1. Copy the native module files:
   - Android: `android/app/src/main/java/com/blemodule/BLEModule.kt` and `BLEPackage.kt`
   - iOS: `ios/BLEModule/BLEModule.swift`
   - TypeScript: `src/BLEModule.ts`

2. Register the native modules:
   - Android: Add `BLEPackage()` to `MainApplication.kt`
   - iOS: The module is automatically registered

3. Update permissions as described above.

4. Import and use the `BLEManager` class in your React components.

## Architecture

### Native Modules

- **Android**: Uses `BluetoothLeScanner` for efficient BLE scanning
- **iOS**: Uses `CBCentralManager` for Core Bluetooth functionality

### TypeScript Interface

- `BLEManager` class provides a clean OOP interface
- Event-driven architecture using DeviceEventEmitter
- Promise-based API for async operations

### Data Management

- Peripherals are managed in a list with deduplication
- Real-time updates for discovered devices
- Efficient state management in React components

## Example App

The included `BLEScanner` component demonstrates:
- Starting/stopping scans with UI buttons
- Displaying discovered peripherals in a list
- Real-time status updates
- Error handling with alerts

## Building and Running

### Android

```sh
npm run android
```

### iOS

```sh
npm run ios
```

## Troubleshooting

- **Bluetooth not enabled**: Ensure Bluetooth is turned on in device settings
- **Permissions denied**: Check that all required permissions are granted
- **No peripherals found**: Ensure BLE devices are in range and advertising
- **iOS build issues**: Run `bundle exec pod install` after updating native code

## API Reference

### BLEManager

#### Methods

- `startScan(): Promise<void>` - Start BLE scanning
- `stopScan(): Promise<void>` - Stop BLE scanning
- `isScanning(): Promise<boolean>` - Check if currently scanning

#### Events

- `onScanStart(callback: () => void)` - Called when scanning starts
- `onScanEnd(callback: () => void)` - Called when scanning ends
- `onPeripheralDiscovered(callback: (peripheral: BLEPeripheral) => void)` - Called for each discovered peripheral

## Contributing

This module demonstrates best practices for React Native native module development:
- Clean separation of concerns
- TypeScript for type safety
- Event-driven architecture
- Cross-platform compatibility
- Proper error handling

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
