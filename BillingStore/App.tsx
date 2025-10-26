import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import PrintJobManager from './src/pages/PrintJobManager';

const App = () => {
  useEffect(() => {
    // Start polling print jobs
    PrintJobManager.startPolling(5000);

    // Stop polling on unmount
    return () => PrintJobManager.stopPolling();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🖨️ Bluetooth Printer App</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>
          PrintJobManager is running. It will automatically connect to the printer and print pending jobs.
        </Text>

        <Button
          title="Stop Printing"
          onPress={() => PrintJobManager.stopPolling()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 18, alignItems: 'center', elevation: 3 },
  headerText: { color: 'white', fontSize: 20, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  infoText: { textAlign: 'center', fontSize: 16, color: '#111', marginBottom: 20 },
});

export default App;
