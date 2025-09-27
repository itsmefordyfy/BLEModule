import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { BLEManager, BLEPeripheral } from './BLEModule';

const BLEScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState<BLEPeripheral[]>([]);
  const [bleManager] = useState(() => new BLEManager());

  useEffect(() => {
    // Request permissions on component mount
    const requestInitialPermissions = async () => {
      try {
        await bleManager.requestPermissions();
      } catch (error) {
        console.log('Permission request failed:', error);
      }
    };

    requestInitialPermissions();

    const onScanStart = () => {
      setIsScanning(true);
      setPeripherals([]);
    };

    const onScanEnd = () => {
      setIsScanning(false);
    };

    const onPeripheralDiscovered = (peripheral: BLEPeripheral) => {
      setPeripherals(prev => {
        const existing = prev.find(p => p.id === peripheral.id);
        if (existing) {
          // Update existing peripheral
          return prev.map(p => (p.id === peripheral.id ? peripheral : p));
        } else {
          // Add new peripheral
          return [...prev, peripheral];
        }
      });
    };

    bleManager.onScanStart(onScanStart);
    bleManager.onScanEnd(onScanEnd);
    bleManager.onPeripheralDiscovered(onPeripheralDiscovered);

    return () => {
      bleManager.removeAllListeners();
    };
  }, [bleManager]);

  const handleStartScan = async () => {
    try {
      // Request permissions first
      await bleManager.requestPermissions();
      // Small delay to ensure permissions are processed
      await new Promise<void>(resolve => setTimeout(resolve, 100));
      // Then start scanning
      await bleManager.startScan();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start scan');
    }
  };

  const handleStopScan = async () => {
    try {
      await bleManager.stopScan();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to stop scan');
    }
  };

  const renderPeripheral = ({ item }: { item: BLEPeripheral }) => (
    <View style={styles.peripheralItem}>
      <Text style={styles.peripheralName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.peripheralId}>{item.id}</Text>
      <Text style={styles.peripheralRssi}>RSSI: {item.rssi} dBm</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Scanner</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isScanning && styles.buttonDisabled]}
          onPress={handleStartScan}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>Start Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isScanning && styles.buttonDisabled]}
          onPress={handleStopScan}
          disabled={!isScanning}
        >
          <Text style={styles.buttonText}>Stop Scan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.status}>
        Status: {isScanning ? 'Scanning...' : 'Not scanning'}
      </Text>

      <Text style={styles.peripheralsTitle}>
        Discovered Peripherals ({peripherals.length})
      </Text>

      <FlatList
        data={peripherals}
        keyExtractor={item => item.id}
        renderItem={renderPeripheral}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  peripheralsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  peripheralItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  peripheralName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  peripheralId: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  peripheralRssi: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default BLEScanner;
