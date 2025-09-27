import CoreBluetooth
import Foundation

@objc(BLEModule)
class BLEModule: NSObject, RCTBridgeModule, CBCentralManagerDelegate {
    static func moduleName() -> String! {
        return "BLEModule"
    }

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    private var centralManager: CBCentralManager!
    private var isScanning = false

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    @objc
    func startScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if centralManager.state != .poweredOn {
            reject("BLUETOOTH_DISABLED", "Bluetooth is not enabled", nil)
            return
        }

        if isScanning {
            reject("ALREADY_SCANNING", "Scan is already in progress", nil)
            return
        }

        centralManager.scanForPeripherals(withServices: nil, options: nil)
        isScanning = true
        sendEvent(withName: "onScanStart", body: nil)
        resolve(nil)
    }

    @objc
    func stopScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if !isScanning {
            reject("NOT_SCANNING", "No scan in progress", nil)
            return
        }

        centralManager.stopScan()
        isScanning = false
        sendEvent(withName: "onScanEnd", body: nil)
        resolve(nil)
    }

    @objc
    func isScanning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(isScanning)
    }

    // CBCentralManagerDelegate
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        // Handle state changes if needed
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        let peripheralData: [String: Any] = [
            "id": peripheral.identifier.uuidString,
            "name": peripheral.name ?? "Unknown",
            "rssi": RSSI.intValue,
            "advertisementData": advertisementData
        ]
        sendEvent(withName: "onPeripheralDiscovered", body: peripheralData)
    }

    private func sendEvent(withName name: String, body: Any?) {
        if let bridge = RCTBridge.current() {
            bridge.eventDispatcher().sendAppEvent(withName: name, body: body)
        }
    }
}