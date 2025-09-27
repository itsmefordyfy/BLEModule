package com.blemodule

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class BLEModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val bluetoothManager: BluetoothManager = reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter
    private var bluetoothLeScanner: BluetoothLeScanner? = null
    private var scanCallback: ScanCallback? = null
    private var isScanning = false

    init {
        bluetoothLeScanner = bluetoothAdapter?.bluetoothLeScanner
    }

    override fun getName(): String {
        return "BLEModule"
    }

    @ReactMethod
    fun requestPermissions(promise: Promise) {
        val activity = reactApplicationContext.currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No activity available")
            return
        }

        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        } else {
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
        }

        ActivityCompat.requestPermissions(activity, permissions, 1)
        promise.resolve(null)
    }

    @ReactMethod
    fun startScan(promise: Promise) {
        if (!hasBluetoothPermissions()) {
            promise.reject("PERMISSION_DENIED", "Bluetooth permissions not granted")
            return
        }

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            promise.reject("BLUETOOTH_DISABLED", "Bluetooth is not enabled")
            return
        }

        if (isScanning) {
            promise.reject("ALREADY_SCANNING", "Scan is already in progress")
            return
        }

        scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                super.onScanResult(callbackType, result)
                val device = result.device
                val peripheral = Arguments.createMap().apply {
                    putString("id", device.address)
                    putString("name", device.name ?: "Unknown")
                    putInt("rssi", result.rssi)
                    // Advertisement data can be added here if needed
                    val advData = Arguments.createMap()
                    result.scanRecord?.let { record ->
                        // Add manufacturer data, service UUIDs, etc.
                        record.manufacturerSpecificData?.let { msd ->
                            for (i in 0 until msd.size()) {
                                val key = msd.keyAt(i)
                                val value = msd.valueAt(i)
                                advData.putString("manufacturer_$key", value.toString())
                            }
                        }
                        record.serviceUuids?.let { uuids ->
                            val uuidArray = Arguments.createArray()
                            uuids.forEach { uuid -> uuidArray.pushString(uuid.toString()) }
                            advData.putArray("serviceUuids", uuidArray)
                        }
                    }
                    putMap("advertisementData", advData)
                }
                sendEvent("onPeripheralDiscovered", peripheral)
            }

            override fun onBatchScanResults(results: MutableList<ScanResult>) {
                super.onBatchScanResults(results)
                // Handle batch results if needed
            }

            override fun onScanFailed(errorCode: Int) {
                super.onScanFailed(errorCode)
                Log.e("BLEModule", "Scan failed with error code: $errorCode")
                stopScanInternal()
                sendEvent("onScanEnd", null)
            }
        }

        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        bluetoothLeScanner?.startScan(null, scanSettings, scanCallback)
        isScanning = true
        sendEvent("onScanStart", null)
        promise.resolve(null)
    }

    @ReactMethod
    fun stopScan(promise: Promise) {
        if (!isScanning) {
            promise.reject("NOT_SCANNING", "No scan in progress")
            return
        }

        stopScanInternal()
        sendEvent("onScanEnd", null)
        promise.resolve(null)
    }

    @ReactMethod
    fun isScanning(promise: Promise) {
        promise.resolve(isScanning)
    }

    private fun stopScanInternal() {
        bluetoothLeScanner?.stopScan(scanCallback)
        isScanning = false
    }

    private fun hasBluetoothPermissions(): Boolean {
        val context = reactApplicationContext
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
        } else {
            ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}