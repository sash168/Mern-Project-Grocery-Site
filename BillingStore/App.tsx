import React, { useEffect, useState } from 'react';
import { 
  View, 
  Button, 
  Alert, 
  Text, 
  Platform, 
  PermissionsAndroid, 
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { BLEPrinter, type IBLEPrinter } from 'react-native-thermal-receipt-printer';

const requestBluetoothPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted' &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === 'granted'
      );
    } catch (err) {
      console.warn('Bluetooth permission error:', err);
      return false;
    }
  }
  return true;
};

const App = () => {
  const [printer, setPrinter] = useState<IBLEPrinter | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await BLEPrinter.init();
        console.log('BLEPrinter initialized successfully');
      } catch (error) {
        console.error('BLEPrinter init failed:', error);
        Alert.alert('Error', 'Failed to initialize BLEPrinter');
      }
    })();
  }, []);

  const connectPrinter = async () => {
    const permissionGranted = await requestBluetoothPermissions();
    if (!permissionGranted) {
      Alert.alert('Permission', 'Bluetooth permissions are required');
      return;
    }

    try {
      const devices = await BLEPrinter.getDeviceList();
      console.log('Devices:', devices);
      if (!devices) {
        Alert.alert('Devices found', 'No devices returned or getDeviceList() failed');
        return;
      }
      if (!Array.isArray(devices) || devices.length === 0) {
        Alert.alert('No Printers', 'No Bluetooth printers found nearby');
        return;
      }

      const selectedPrinter = devices[0];
      await BLEPrinter.connectPrinter(selectedPrinter.inner_mac_address);
      setPrinter(selectedPrinter);
      Alert.alert('Connected', `Connected to ${selectedPrinter.device_name}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Connection Error', message);
    }
  };

  const printReceipt = async () => {
    if (!printer) {
      Alert.alert('No Printer', 'Please connect to a printer first');
      return;
    }

    try {
      await BLEPrinter.printText('<C>Receipt</C>\n');
      await BLEPrinter.printText('<L>Item 1</L>\n');
      await BLEPrinter.printText('<L>Item 2</L>\n');
      await BLEPrinter.printText('<L>Total: $20</L>\n');
      await BLEPrinter.printText('<C>Thank you!</C>\n');
      Alert.alert('Printed', 'Receipt printed successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Print Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🖨️ Bluetooth Printer App</Text>
      </View>

      {/* 🔹 Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Connect Bluetooth Printer" onPress={connectPrinter} />
        <View style={{ height: 20 }} />
        <Button title="Print Receipt" onPress={printReceipt} />
      </View>

      {/* 🔹 Printer Info */}
      {printer && (
        <Text style={styles.connectedText}>
          ✅ Connected to: {printer.device_name}
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 3,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 80,
    width: '80%',
    alignItems: 'center',
  },
  connectedText: {
    marginTop: 30,
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '500',
  },
});

export default App;
