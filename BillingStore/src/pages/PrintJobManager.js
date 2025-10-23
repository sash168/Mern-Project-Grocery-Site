import axios from 'axios';
// import { BLEPrinter, COMMANDS } from 'react-native-thermal-receipt-printer';
import { BluetoothManager, BluetoothEscposPrinter } from '@ccdilan/react-native-bluetooth-escpos-printer';
import { Alert } from 'react-native';

const API_BASE = 'http://192.168.0.103:4000/api/print'; // replace with your LAN IP
let pollingInterval = null;

const PrintJobManager = {
  async fetchPendingJobs(printerId = null) {
    try {
      const res = await axios.get(`${API_BASE}/pending`, {
        params: { printerId }
      });
      return res.data || [];
    } catch (err) {
      console.error('Error fetching jobs:', err);
      return [];
    }
  },

  async markJobDone(jobId) {
    try {
      await axios.delete(`${API_BASE}/done/${jobId}`);
      console.log(`Job ${jobId} marked done`);
    } catch (err) {
      console.error('Error marking job done:', err);
    }
  },

  // Function to print the order in invoice format
  // async printInvoiceBLE(order) {
  //   try {
  //     const now = new Date(order.createdAt);
  //     const formattedDate = now.toLocaleDateString();
  //     const invoiceNo = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}1`;

  //     await BLEPrinter.printImage('../../assets/Logo.jpg', {
  //       imageWidth: 300, // width in pixels, adjust as needed
  //       imageHeight: 150, // optional, maintain aspect ratio
  //     });


  //     let bill = '';
  //     bill += '________________________________\n';
  //     bill += `Invoice No : INV${invoiceNo}\n`;
  //     bill += `Date       : ${formattedDate}\n`;
  //     bill += `Customer   : ${order.customerName || 'Guest'}\n`;
  //     bill += `Contact    : ${order.customerNumber || 'N/A'}\n`;
  //     bill += '________________________________\n';
  //     bill += 'Item            Qty     Amt\n';
  //     bill += '________________________________\n';

  //     order.items.forEach(item => {
  //       const name = item.name.length > 16 ? item.name.slice(0, 16) : item.name.padEnd(16, ' ');
  //       const qty = String(item.quantity).padEnd(4, ' ');
  //       const amount = (item.offerPrice || item.price || 0) * item.quantity;
  //       const amt = `Rs${amount.toFixed(2)}`;
  //       bill += `${name}${qty}${amt}\n`;
  //     });

  //     bill += '________________________________\n';
  //     bill += `TOTAL QTY  : ${order.items.reduce((sum, i) => sum + i.quantity, 0)}\n`;
  //     bill += `SUBTOTAL   : Rs${order.amount.toFixed(2)}\n`;
  //     bill += '********************************\n';
  //     bill += '    THANK YOU FOR SHOPPING!\n';
  //     bill += '********************************\n\n';

  //     await BLEPrinter.printText(bill);
  //     console.log('🖨️ Print successful');
  //   } catch (err) {
  //     console.error('BLE Print Error:', err);
  //   }
  // },

  async printInvoiceBLE(order) {
  try {
    await BluetoothManager.enableBluetooth();

    // Connect to your printer's MAC address (replace with actual)
    await BluetoothManager.connect('02:BB:CD:01:7A:78');



    await BluetoothEscposPrinter.printerInit();

    // Optional: Print logo if you have Base64 logo string
    // await BluetoothEscposPrinter.printPic(base64LogoString, { width: 384, left: 0 });

    // Header: Store name bold + centered
    await BluetoothEscposPrinter.printText('My Store\n', {
      widthtimes: 2,
      heigthtimes: 2,
      align: BluetoothEscposPrinter.ALIGN.CENTER,
      bold: true,
    });

    // Invoice info left aligned
    await BluetoothEscposPrinter.printText(`Invoice No: INV${order.invoiceNo || '0001'}\nDate: ${new Date(order.createdAt).toLocaleDateString()}\n`, {
      align: BluetoothEscposPrinter.ALIGN.LEFT,
    });

    await BluetoothEscposPrinter.printText('--------------------------------\n');

    // Print columns headers
    await BluetoothEscposPrinter.printColumnsText(
      ['Item', 'Qty', 'Amount'],
      [16, 4, 10],
      [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT]
    );

    // Print each item in columns
    for (const item of order.items) {
      const amount = ((item.offerPrice || item.price || 0) * item.quantity).toFixed(2);
      await BluetoothEscposPrinter.printColumnsText(
        [item.name.length > 16 ? item.name.substring(0, 16) : item.name.padEnd(16), item.quantity.toString(), `Rs${amount}`],
        [16, 4, 10],
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT]
      );
    }

    await BluetoothEscposPrinter.printText('--------------------------------\n');

    // Total & thanks note
    await BluetoothEscposPrinter.printText(`Total Qty: ${order.items.reduce((acc, i) => acc + i.quantity, 0)}\nSubtotal: Rs${order.amount.toFixed(2)}\n`, {
      bold: true,
    });

    await BluetoothEscposPrinter.printText('\nThank you for shopping!\n\n', {
      align: BluetoothEscposPrinter.ALIGN.CENTER,
    });

    console.log('🖨️ Print successful');
  } catch (err) {
    console.error('Print failed:', err);
  }
},

  async processJobs() {
    const jobs = await this.fetchPendingJobs();
    if (!jobs.length) return;

    console.log(`🖨️ Found ${jobs.length} print job(s)`);

    for (const job of jobs) {
      try {
        const order = JSON.parse(job.text);

        // Print the order using formatted invoice
        await this.printInvoiceBLE(order);

        // Mark job done
        await this.markJobDone(job.id);
      } catch (err) {
        console.error('Error printing job:', err);
      }
    }
  },
  startPolling(intervalMs) {
  const ms = intervalMs || 5000; // default 5 seconds
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => this.processJobs(), ms);
},

  // New: stop polling
  stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log('Stopped polling');
    }
  }
};


export default PrintJobManager;
