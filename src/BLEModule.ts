import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';

export interface BLEPeripheral {
  id: string;
  name?: string;
  rssi: number;
  advertisementData?: { [key: string]: any };
}

export interface BLEModuleInterface {
  requestPermissions(): Promise<void>;
  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  isScanning(): Promise<boolean>;
}

const BLEModule: BLEModuleInterface = NativeModules.BLEModule;

if (!BLEModule) {
  throw new Error('BLEModule is not available. Make sure the native module is properly linked.');
}

export const BLEEvents = {
  SCAN_START: 'onScanStart',
  SCAN_END: 'onScanEnd',
  PERIPHERAL_DISCOVERED: 'onPeripheralDiscovered',
} as const;

export class BLEManager {
  private eventListeners: EmitterSubscription[] = [];

  requestPermissions(): Promise<void> {
    return BLEModule.requestPermissions();
  }

  startScan(): Promise<void> {
    return BLEModule.startScan();
  }

  stopScan(): Promise<void> {
    return BLEModule.stopScan();
  }

  isScanning(): Promise<boolean> {
    return BLEModule.isScanning();
  }

  onScanStart(callback: () => void): void {
    const listener = DeviceEventEmitter.addListener(BLEEvents.SCAN_START, callback);
    this.eventListeners.push(listener);
  }

  onScanEnd(callback: () => void): void {
    const listener = DeviceEventEmitter.addListener(BLEEvents.SCAN_END, callback);
    this.eventListeners.push(listener);
  }

  onPeripheralDiscovered(callback: (peripheral: BLEPeripheral) => void): void {
    const listener = DeviceEventEmitter.addListener(BLEEvents.PERIPHERAL_DISCOVERED, callback);
    this.eventListeners.push(listener);
  }

  removeAllListeners(): void {
    this.eventListeners.forEach(listener => listener.remove());
    this.eventListeners = [];
  }
}

export default BLEModule;