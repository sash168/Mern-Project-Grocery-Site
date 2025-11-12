import axios from 'axios';
import RNFS from 'react-native-fs';
import { BluetoothManager, BluetoothEscposPrinter } from '@ccdilan/react-native-bluetooth-escpos-printer';
import { Platform } from 'react-native';

const API_BASE = 'http://192.168.0.104:4000/api/print';
let pollingInterval = null;

// ✅ Paths for local images
const LOGO_PATH = Platform.OS === 'android' ? 'Logo.jpg' : `${RNFS.MainBundlePath}/Logo.jpg`;
const QR_PATH = Platform.OS === 'android' ? 'qr.jpg' : `${RNFS.MainBundlePath}/qr.jpg`;

// Helper: Convert local image to Base64
async function localImageToBase64(localPath) {
  try {
    if (Platform.OS === 'android') {
      return await RNFS.readFileAssets(localPath, 'base64');
    } else {
      return await RNFS.readFile(localPath, 'base64');
    }
  } catch (err) {
    console.error('Error converting local image to base64:', err);
    throw err;
  }
}

// Helper: Center margin for image
function getImageLeftMargin(imgWidth, printerWidth = 384) {
  return Math.floor((printerWidth - imgWidth) / 2);
}

const PrintJobManager = {
  printerConnected: false,

  async fetchPendingJobs(printerId = null) {
    try {
      const res = await axios.get(`${API_BASE}/pending`, { params: { printerId } });
      return res.data || [];
    } catch (err) {
      console.error('Error fetching jobs:', err);
      return [];
    }
  },

 async markJobDone(jobId) {
  const url = `${API_BASE}/done/${jobId}`;
  console.log('Deleting job at URL:', url);
  try {
    await axios.delete(url);
    console.log(`✅ Job ${jobId} marked done`);
  } catch (err) {
    console.error('Error marking job done:', err.response?.status, err.response?.data || err);
  }
},

  async connectPrinterOnce(macAddress) {
  if (this.printerConnected) return;

  try {
    await BluetoothManager.enableBluetooth();
    await BluetoothManager.connect(macAddress);
    this.printerConnected = true;
    await BluetoothEscposPrinter.printerInit();
    console.log('🖨️ Printer connected');
  } catch (err) {
    console.error('❌ Printer connect failed:', err);
    throw err;
  }
},

  async printInvoiceBLE(order, macAddress = '02:BB:CD:01:7A:78') {
    try {
      await this.connectPrinterOnce(macAddress);

      // 1️⃣ Print Logo
      try {
        const logoBase64 = await localImageToBase64(LOGO_PATH);
        await BluetoothEscposPrinter.printPic(logoBase64, { width: 200, left: getImageLeftMargin(230) });
      } catch (err) {
        console.warn('⚠️ Logo print failed:', err);
      }

      await BluetoothEscposPrinter.printText('Bhimpur, Odissa, pin - 761043\nContact No:- 9137127558\n', {});

      // 3️⃣ Invoice Info
      await BluetoothEscposPrinter.printText(
        `\nInvoice No: INV${order.invoiceNo || '0001'}\nDate: ${new Date(order.createdAt).toLocaleDateString()}\n`,
        { align: BluetoothEscposPrinter.ALIGN.LEFT }
      );
      await BluetoothEscposPrinter.printText('________________________________\n', {});

      // 4️⃣ Column Header
      await BluetoothEscposPrinter.printText('Item            Qty    Amt\n', { align: BluetoothEscposPrinter.ALIGN.LEFT, bold: true });
      await BluetoothEscposPrinter.printText('________________________________\n', {});

      // 5️⃣ Items
      for (const item of order.items) {
        const name = item.name.length > 14 ? item.name.substring(0, 14) : item.name.padEnd(14);
        const qty = String(item.quantity).padStart(3);
        const amount = ((item.offerPrice ?? item.price ?? 0) * item.quantity).toFixed(2);
        await BluetoothEscposPrinter.printText(`${name} ${qty}   Rs${amount}\n`, { align: BluetoothEscposPrinter.ALIGN.LEFT });
      }
      await BluetoothEscposPrinter.printText('________________________________\n', {});

      const totalAmount = Number(order.amount || 0);
      const paidAmount = Number(order.paidAmount || 0);
      const dueAmount = Number(order.dueAmount || (totalAmount - paidAmount));

      const paymentStatus =
        paidAmount >= totalAmount
          ? 'Fully Paid'
          : paidAmount > 0
          ? `Due ₹${dueAmount.toFixed(2)}`
          : 'Payment Pending';

      // 6️⃣ Totals
      const totalQty = order.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
      await BluetoothEscposPrinter.printText(
        `Total Qty: ${totalQty}\nSubtotal: Rs${(order.amount ?? 0).toFixed(2)}\n`,
        { bold: true }
      );
      await BluetoothEscposPrinter.printText(`Payment: ${paymentStatus}\n`, { bold: true });
      await BluetoothEscposPrinter.printText('********************************\n', {});

      // 7️⃣ Print QR
      try {
        const qrBase64 = await localImageToBase64(QR_PATH);
        await BluetoothEscposPrinter.printPic(qrBase64, { width: 200, left: getImageLeftMargin(200) });
      } catch (err) {
        console.warn('⚠️ QR print failed:', err);
      }

      // 8️⃣ Thank-you message
      await BluetoothEscposPrinter.printText('\nThank you for shopping!\n', { align: BluetoothEscposPrinter.ALIGN.CENTER });
      await BluetoothEscposPrinter.printText('********************************\n\n\n\n', {});

      console.log('🖨️ Print successful');
      // Beep 1 time, 300ms duration, 100% volume
      await BluetoothEscposPrinter.printerSound(1, 200);

    } catch (err) {
      console.error('❌ Print failed:', err);
    }
  },

  async processJobs() {
    const jobs = await this.fetchPendingJobs();
    if (!jobs.length) return;

    console.log(`🖨️ Found ${jobs.length} print job(s)`);

    for (const job of jobs) {
      try {
        const order = JSON.parse(job.text);
        await this.printInvoiceBLE(order);
        await this.markJobDone(job.id);
      } catch (err) {
        console.error('Error printing job:', err);
      }
    }
  },

  startPolling(intervalMs = 5000) {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => this.processJobs(), intervalMs);
  },

  stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log('Stopped polling');
    }
  },
};

export default PrintJobManager;
