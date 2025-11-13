import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import PrintJobManager, { printerEvents } from './src/pages/PrintJobManager';

interface PrinterStatus {
  connected: boolean;
  message: string;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<PrinterStatus>({
    connected: false,
    message: 'Bluetooth not connected',
  });

  useEffect(() => {
    const listener = (data: PrinterStatus) => {
      console.log('📡 Printer status update:', data);
      setStatus(data);
    };

    printerEvents.on('status', listener);
    PrintJobManager.startPolling(5000);

    return () => {
      printerEvents.off('status', listener);
      PrintJobManager.stopPolling();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🖨️ Bluetooth Printer App</Text>
      </View>

      <View
        style={[
          styles.statusBar,
          { backgroundColor: status.connected ? '#C8F7C5' : '#FFD6D6' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: status.connected ? '#006400' : '#800000' },
          ]}
        >
          {status.message}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>
          The app automatically connects and prints pending jobs.
        </Text>

        <Button
          title="🛑 Stop Polling"
          color="#DC2626"
          onPress={() => PrintJobManager.stopPolling()}
        />
        <View style={{ height: 10 }} />
        <Button
          title="▶️ Start Polling"
          color="#16A34A"
          onPress={() => PrintJobManager.startPolling(5000)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    alignItems: 'center',
  },
  headerText: { color: 'white', fontSize: 20, fontWeight: '600' },
  statusBar: { margin: 12, padding: 10, borderRadius: 10, alignItems: 'center' },
  statusText: { fontWeight: '600', fontSize: 15 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { textAlign: 'center', fontSize: 16, color: '#111', marginBottom: 20 },
});

export default App;
