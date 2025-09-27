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
  id: string; // Unique identifier (UUID)
  name?: string; // Device name (may be undefined)
  rssi: number; // Signal strength in dBm
  advertisementData?: {
    // Additional advertisement data
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
