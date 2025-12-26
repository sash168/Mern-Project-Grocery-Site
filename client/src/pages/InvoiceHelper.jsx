import jsPDF from "jspdf";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext"; // Assuming you have axios here

// Helper to send print job to backend
export const sendPrintJobToBackend = async (order, axios) => {
  try {
    const res = await axios.post("/api/print/create", {
      printerId: null, // optional, if you have multiple printers
      text: JSON.stringify(order) // backend expects "text"
    });
    if (res.data.success || res.data.message) {
      toast.success("Sent to printer app");
    } else {
      toast.error("Failed to send print job");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error sending print job");
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (order, currency, user, orderIndex = 1, companyName = "BS Soda") => {
  const doc = new jsPDF();
  let y = 20;
 const orderDate = new Date(order.createdAt);
  const invoiceNo = `${String(orderDate.getDate()).padStart(2,'0')}${String(orderDate.getMonth()+1).padStart(2,'0')}${orderIndex}`;

  const safeCurrency = currency === "₹" ? "Rs." : currency;

  // Header
  doc.setFontSize(18);
  if (companyName) {
    doc.setFont(undefined, "bold");
    doc.text(`${companyName}`, 105, y, { align: "center" });
    y += 10;
  }

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Invoice", 105, y, { align: "center" });
  y += 12;

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(`Invoice No: ${invoiceNo}`, 10, y); y += 7;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 10, y); y += 7;

  // Table header
  doc.setFont(undefined, "bold");
  doc.text("Item", 10, y);
  doc.text("Qty", 100, y);
  doc.text("Amount", 150, y);
  y += 5;
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 7;

  // Products
  doc.setFont(undefined, "normal");
  order.items.forEach((item) => {
    const name = item.product?.name || item.name || "Deleted Product";
    const qty = item.quantity;
    const amount = ((item.product?.offerPrice || item.offerPrice || 0) * qty).toFixed(2);

    doc.text(name, 10, y);
    doc.text(`${qty}`, 100, y);
    doc.text(`${safeCurrency}${amount}`, 150, y);
    y += 7;
  });

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 7;

  // Totals
  doc.setFont(undefined, "bold");
  doc.text(`Total Quantity: ${order.items.reduce((sum, i) => sum + i.quantity, 0)}`, 10, y); y += 7;
  doc.text(`Subtotal: ${safeCurrency}${order.amount.toFixed(2)}`, 10, y);

  doc.save(`Invoice_INV${invoiceNo}.pdf`);
};

// In InvoiceHelper.js - YOUR ORIGINAL FIXED VERSION
export const printInvoice = (order) => {
  if (!order || !order.items?.length) return;

  const now = new Date();
  let bill = `S3 Retail Hub\n${'='.repeat(25)}\n`;
  bill += `Invoice: ${now.getTime()}\n`;
  bill += `Date: ${now.toLocaleDateString("en-IN")}\n`;
  bill += `Customer: ${order.address?.name || "Guest"}\n`;
  bill += `${'='.repeat(25)}\n`;

  let subtotal = 0;
  order.items.forEach(item => {
    const name = (item.product?.name || 'Item').slice(0, 20).padEnd(20);
    const price = (item.product?.offerPrice || item.offerPrice || 0) * (item.quantity || 1);
    subtotal += price;
    bill += `${name}x${(item.quantity || 1).toString().padStart(2)} ₹${price.toFixed(2)}\n`;
  });

  bill += `${'='.repeat(25)}\nTotal: ₹${order.amount?.toFixed(2)}\n${'='.repeat(25)}\nThank you!\n`;

  // ✅ NEW WINDOW - WORKS EVERYWHERE
  const printWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
  
  if (!printWindow) {
    alert('Please allow popups then try again');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Bill</title>
      <style>
        @page { size: 58mm auto; margin: 0; }
        body { 
          margin: 0; padding: 8px; width: 58mm; 
          font-family: 'Courier New', monospace; 
          font-size: 12px; line-height: 1.2;
        }
        pre { white-space: pre-wrap; margin: 0; }
      </style>
    </head>
    <body>
      <pre>${bill}</pre>
      <script>
        window.onload = () => {
          window.focus(); 
          window.print(); 
          setTimeout(() => window.close(), 2000);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

export const printInvoiceMobileFriendly = (order) => {
  if (!order || !order.items?.length) return;

  // 🧹 CLEANUP PREVIOUS FRAMES
  document.querySelectorAll('iframe[data-print-bill]').forEach(frame => frame.remove());

  const now = new Date();
  let billContent = `S3 Retail Hub\n${'='.repeat(25)}\n`;
  billContent += `Invoice: ${now.getTime()}\n`;
  billContent += `Date: ${now.toLocaleDateString("en-IN")}\n`;
  billContent += `Customer: ${order.address?.name || "Guest"}\n`;
  billContent += `${'='.repeat(25)}\n`;

  let subtotal = 0;
  order.items.forEach(item => {
    const name = (item.product?.name || item.name || 'Item').slice(0, 20).padEnd(20);
    const price = (item.product?.offerPrice || item.offerPrice || 0) * (item.quantity || 1);
    subtotal += price;
    billContent += `${name} x${(item.quantity || 1).toString().padStart(2)} ₹${price.toFixed(2)}\n`;
  });

  billContent += `${'='.repeat(25)}\n`;
  billContent += `Total: ₹${order.amount?.toFixed(2) || subtotal.toFixed(2)}\n`;
  billContent += `${'='.repeat(25)}\nThank you! Visit again\n`;

  // 🎯 BULLETPROOF IFRAME WITH ISOLATED STYLES
  const printFrame = document.createElement('iframe');
  printFrame.setAttribute('data-print-bill', 'true');
  printFrame.style.cssText = `
    position: fixed !important;
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    width: 100vw !important; height: 100vh !important;
    border: none !important; z-index: 999999 !important;
    background: white !important; display: block !important;
  `;
  document.body.appendChild(printFrame);

  const doc = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html style="margin:0;padding:0;height:100%;">
      <head>
        <title>PRINT BILL - DO NOT CLOSE</title>
        <meta name="viewport" content="width=58mm, initial-scale=1">
        <style>
          /* 🔒 ISOLATE FROM PARENT CSS */
          html, body, pre, * {
            all: revert !important;
            box-sizing: border-box !important;
          }
          
          /* 📄 PAGE SIZE */
          @page {
            size: 58mm auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* 🖨 PRINT ONLY */
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
          
          /* 📱 MOBILE + DESKTOP */
          body {
            margin: 0 !important;
            padding: 6px 8px !important;
            width: 58mm !important;
            max-width: 58mm !important;
            font-family: 'Courier New', 'Lucida Console', Consolas, monospace !important;
            font-size: 12px !important;
            line-height: 1.15 !important;
            background: white !important;
            color: black !important;
            overflow: hidden !important;
          }
          
          pre {
            margin: 0 !important;
            padding: 0 !important;
            white-space: pre-wrap !important;
            font-family: inherit !important;
            font-size: inherit !important;
            line-height: inherit !important;
            font-weight: normal !important;
          }
        </style>
      </head>
      <body>
        <pre>${billContent}</pre>
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 200);
            
            // Cleanup handlers
            window.onafterprint = function() {
              setTimeout(function() {
                if (parent && parent.document) {
                  const frame = parent.document.querySelector('iframe[data-print-bill]');
                  if (frame) frame.remove();
                }
              }, 500);
            };
          });
        <\/script>
      </body>
    </html>
  `);
  doc.close();

  // 🔄 FORCE CLEANUP
  setTimeout(() => {
    const frame = document.querySelector('iframe[data-print-bill]');
    if (frame) frame.remove();
  }, 5000);
};


export const printThermalBill = (order, companyName = "S3 Retail Hub", serial = 1) => {

  // STEP 1 — Calculate dynamic height
  const baseHeight = 60; // minimum bill height
  const itemHeight = order.items.length * 6;
  const totalHeight = Math.max(baseHeight + itemHeight, 100);

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [58, totalHeight] // 58mm width, height auto
  });

  let y = 6;

  // ---------------- HEADER ----------------
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text(companyName, 29, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.text("INVOICE", 29, y, { align: "center" });
  y += 6;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);

  const today = new Date(order.createdAt);
  const formattedDate = today.toLocaleDateString("en-IN");

  // Invoice number format: YYYYMMDD-Serial
  const invoiceNum =
    `${today.getFullYear()}` +
    `${String(today.getDate()).padStart(2, "0")}${serial}`;

  doc.text(`Date: ${formattedDate}`, 2, y); y += 4;
  doc.text(`Invoice No: ${invoiceNum}`, 2, y); y += 6;

  doc.line(2, y, 56, y);
  y += 5;

  // ---------------- TABLE HEADER ----------------
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Item", 2, y);
  doc.text("Qty", 28, y, { align: "right" });
  doc.text("Amt", 56, y, { align: "right" });
  y += 4;

  doc.line(2, y, 56, y);
  y += 4;

  // ---------------- ITEMS ----------------
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);

  order.items.forEach((item) => {
    const name = item.product?.name || item.name;
    const qty = item.quantity;
    const price = item.product?.offerPrice || item.offerPrice || 0;
    const total = qty * price;

    doc.text(name.substring(0, 18), 2, y);
    doc.text(String(qty), 28, y, { align: "right" });
    doc.text(String(total), 56, y, { align: "right" });
    y += 5;
  });

  doc.line(2, y, 56, y);
  y += 6;

  // ---------------- TOTALS ----------------
  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);

  doc.setFont("Helvetica", "normal");
  doc.text(`Total Qty: ${totalQty}`, 2, y); y += 4;

  doc.text(`Subtotal: Rs. ${order.amount}`, 2, y); y += 4;

  if (order.discount) {
    doc.text(`Discount: Rs. ${order.discount}`, 2, y);
    y += 4;
  }

  // Bold Grand Total
  doc.setFont("Helvetica", "bold");
  doc.text(`Grand Total: Rs. ${order.finalAmount || order.amount}`, 2, y);
  y += 8;

  // Footer
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Thank you! Visit again", 29, y, { align: "center" });

  // ---------------- SAVE + PRINT ----------------
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);

  window.open(url); // open print dialog on Android

  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNum}.pdf`;
  a.click();
};


