import axios from 'axios';
import RNFS from 'react-native-fs';
import { BluetoothManager, BluetoothEscposPrinter } from '@ccdilan/react-native-bluetooth-escpos-printer';
import { Platform } from 'react-native';
import EventEmitter from 'eventemitter3';

const printerEvents = new EventEmitter();
const API_BASE = 'https://mern-project-grocery-site.vercel.app/api/print';
let pollingInterval = null;

// ✅ Local asset paths
const LOGO_PATH = Platform.OS === 'android' ? 'Logo1.jpeg' : `${RNFS.MainBundlePath}/Logo.jpg`;
const QR_PATH = Platform.OS === 'android' ? 'qr.jpg' : `${RNFS.MainBundlePath}/qr.jpg`;

function logEvent(connected, message) {
  console.log('📢 STATUS EVENT:', message);
  printerEvents.emit('status', { connected, message });
}

async function localImageToBase64(localPath) {
  try {
    console.log('🖼️ Converting image to Base64:', localPath);
    if (Platform.OS === 'android') {
      const data = await RNFS.readFileAssets(localPath, 'base64');
      console.log('✅ Image read from assets');
      return data;
    } else {
      const data = await RNFS.readFile(localPath, 'base64');
      console.log('✅ Image read from bundle');
      return data;
    }
  } catch (err) {
    console.error('❌ Error converting image:', err.message);
    throw err;
  }
}

function getImageLeftMargin(imgWidth, printerWidth = 384) {
  return Math.floor((printerWidth - imgWidth) / 2);
}

const PrintJobManager = {
  printerConnected: false,

  async fetchPendingJobs(printerId = null) {
    console.log('📡 Fetching pending print jobs...');
    try {
      const res = await axios.get(`${API_BASE}/pending`, { params: { printerId } });
      console.log(`✅ Received ${res.data?.length || 0} jobs`);
      return res.data || [];
    } catch (err) {
      console.error('❌ Error fetching jobs:', err.message);
      return [];
    }
  },

  async markJobDone(jobId) {
    const url = `${API_BASE}/done/${jobId}`;
    console.log('🗑️ Marking job done:', url);
    try {
      await axios.delete(url);
      console.log(`✅ Job ${jobId} marked done`);
    } catch (err) {
      console.error('❌ Error marking job done:', err.message);
    }
  },

  async connectPrinterOnce(macAddress) {
    if (this.printerConnected) {
      console.log('🔁 Printer already connected');
      logEvent(true, 'Printer already connected');
      return;
    }

    console.log('🔌 Enabling Bluetooth...');
    logEvent(false, 'Enabling Bluetooth...');

    try {
      const devices = await BluetoothManager.enableBluetooth();
      console.log('✅ Bluetooth enabled. Devices:', devices);

      logEvent(false, 'Connecting to printer...');
      console.log('📡 Connecting to printer at:', macAddress);

      await BluetoothManager.connect(macAddress);
      console.log('✅ Connected to printer');

      await BluetoothEscposPrinter.printerInit();
      console.log('🖨️ Printer initialized');

      this.printerConnected = true;
      logEvent(true, '✅ Printer connected');
    } catch (err) {
      console.error('❌ Printer connect failed:', err.message);
      logEvent(false, '❌ Printer connection failed');
    }
  },

  async printInvoiceBLE(order, macAddress = '02:BB:CD:01:7A:78') {
    console.log('🧾 Starting print for order:', order?.invoiceNo || '(unknown)');
    console.log("🧾 printInvoice() called with order:", order);
    try {
      await this.connectPrinterOnce(macAddress);

      const logoBase64 = await localImageToBase64(LOGO_PATH);
      await BluetoothEscposPrinter.printPic(logoBase64, { width: 150, left: getImageLeftMargin(230) });

      await BluetoothEscposPrinter.printText('Bhimpur, Odissa, pin - 761043\nContact No:- 9137127558\n', {});
      await BluetoothEscposPrinter.printText(
        `\nInvoice No: INV${order.invoiceNo || '0001'}\nDate: ${new Date(order.createdAt).toLocaleDateString()}\n`,
        { align: BluetoothEscposPrinter.ALIGN.LEFT }
      );

      await BluetoothEscposPrinter.printText('________________________________\n', {});
      await BluetoothEscposPrinter.printText('Item            Qty    Amt\n', { bold: true });
      await BluetoothEscposPrinter.printText('________________________________\n', {});

      try {
        const items = Array.isArray(order?.items) ? order.items : [];
        if (items.length === 0) {
          console.log('⚠️ No valid items to print for job:', order?.invoiceNo);
          return;
        }

      } catch (err) {
        console.error('❌ Error processing items:', err.message);
        return;
      }

      for (const item of order.items) {
        const productName = item?.product?.name ?? 'Unknown';
        const name =
          productName.length > 14
            ? productName.substring(0, 14)
            : productName.padEnd(14);
        const qty = String(item.quantity ?? 0).padStart(3);
        const price = item?.product?.offerPrice ?? item?.product?.price ?? 0;
        const amount = (price * (item.quantity ?? 0)).toFixed(2);

        await BluetoothEscposPrinter.printText(`${name} ${qty}   Rs${amount}\n`, {});
      }


      await BluetoothEscposPrinter.printText('________________________________\n', {});
      const totalAmount = Number(order.amount || 0);
      const paidAmount = Number(order.paidAmount || 0);
      const dueAmount = totalAmount - paidAmount;

      await BluetoothEscposPrinter.printText(
        `Total: Rs${totalAmount.toFixed(2)} | Paid: Rs${paidAmount.toFixed(2)} | Due: Rs${dueAmount.toFixed(2)}\n`,
        { bold: true }
      );

      const qrBase64 = await localImageToBase64(QR_PATH);
      await BluetoothEscposPrinter.printPic(qrBase64, { width: 200, left: getImageLeftMargin(200) });
      await BluetoothEscposPrinter.printText('********************************\n', {});
      await BluetoothEscposPrinter.printText('Thank you for shopping!\n\n\n\n', {
        align: BluetoothEscposPrinter.ALIGN.CENTER,
      });

      console.log('✅ Print successful');
    } catch (err) {
      console.error('❌ Print failed:', err.message);
    }
  },

  async processJobs() {
    console.log('🔁 Checking for print jobs...');
    const jobs = await this.fetchPendingJobs();
    if (!jobs.length) {
      console.log('⏸️ No pending jobs.');
      return;
    }

    console.log(`🖨️ Found ${jobs.length} job(s)`);
    for (const job of jobs) {
      try {
        const order = JSON.parse(job.text);
        await this.printInvoiceBLE(order);
        await this.markJobDone(job.id);
      } catch (err) {
        console.error('❌ Error printing job:', err.message);
      }
    }
  },

  startPolling(intervalMs = 5000) {
    console.log(`🚀 Starting job polling every ${intervalMs / 1000}s`);
    if (pollingInterval) clearInterval(pollingInterval);
    this.processJobs();
    pollingInterval = setInterval(() => this.processJobs(), intervalMs);
  },

  stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log('🛑 Stopped polling');
    }
  },
};

export default PrintJobManager;
export { printerEvents };
