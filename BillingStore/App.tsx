import React, { useEffect, useState } from 'react';
import { View, Button, Alert, Text, Platform, PermissionsAndroid } from 'react-native';
import { BLEPrinter, type IBLEPrinter } from 'react-native-thermal-receipt-printer';
import MainBanner from './src/components/MainBanner';

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
    <View style={{ paddingTop: 100, alignItems: 'center' }}>
      <MainBanner />
      <Button title="Connect Bluetooth Printer" onPress={connectPrinter} />
      <View style={{ height: 20 }} />
      <Button title="Print Receipt" onPress={printReceipt} />
      {printer && <Text style={{ marginTop: 20 }}>Connected to: {printer.device_name}</Text>}
    </View>
  );
};

export default App;
