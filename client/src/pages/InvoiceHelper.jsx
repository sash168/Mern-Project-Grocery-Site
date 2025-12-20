import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext"; // Assuming you have axios here

// Helper to send print job to backend
export const sendPrintJobToBackend = async (order, axios) => {
  try {
    const res = await axios.post("/api/print/create", {
      printerId: null, // optional, if you have multiple printers
      text: JSON.stringify(order) // backend expects "text"
    });
    if (res.data.success || res.data.message) {
      toast.success(res.data.message || "Print job sent!");
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

export const printInvoice = (order) => {
  if (!order) return;

  const now = new Date();

  let bill = `
S3 Retail Hub
------------------------------
Invoice: ${now.getTime()}
Date: ${now.toLocaleDateString("en-IN")}
Customer: ${order.customerName || "Guest"}
------------------------------
`;

  order.items.forEach(i => {
    const name = (i.product?.name || i.name).slice(0, 20);
    const price = (i.product?.offerPrice || i.offerPrice) * i.quantity;
    bill += `${name} x${i.quantity}   ₹${price}\n`;
  });

  bill += `
------------------------------
Total: ₹${order.amount}
------------------------------
Thank you! Visit again
`;

  // ✅ OPEN A NEW PRINT WINDOW (THIS IS THE KEY)
  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 8px;
            width: 58mm;
            font-family: monospace;
            font-size: 12px;
          }
          pre {
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <pre>${bill}</pre>
        <script>
          window.onload = function () {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export const printInvoiceMobileFriendly = (order) => {
  if (!order || !order.items?.length) return;

  // ✅ DESTROY PREVIOUS IFRAME FIRST (CRITICAL FIX)
  const existingFrame = document.querySelector('iframe[data-print-bill]');
  if (existingFrame) {
    existingFrame.remove();
  }

  const now = new Date();
  const uniqueId = `print-${Date.now()}`; // Unique ID per print
  
  let billContent = `S3 Retail Hub\n${'='.repeat(25)}\nInvoice: ${now.getTime()}\nDate: ${now.toLocaleDateString("en-IN")}\nCustomer: ${order.customerName || "Guest"}\n${'='.repeat(25)}\n`;

  let subtotal = 0;
  order.items.forEach(i => {
    const name = (i.product?.name || i.name || 'Item').slice(0, 20).padEnd(20);
    const unitPrice = i.product?.offerPrice || i.offerPrice || 0;
    const qty = i.quantity || 1;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    billContent += `${name} x${qty.toString().padStart(2)} ₹${lineTotal.toFixed(2)}\n`;
  });

  billContent += `${'='.repeat(25)}\nSubtotal: ₹${subtotal.toFixed(2)}\nTotal: ₹${order.amount?.toFixed(2) || subtotal.toFixed(2)}\n${'='.repeat(25)}\nThank you! Visit again\n`;

  // ✅ NEW IFRAME WITH UNIQUE ID AND SIZE PARAMETER
  const printFrame = document.createElement('iframe');
  printFrame.id = uniqueId;
  printFrame.setAttribute('data-print-bill', 'true');
  printFrame.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    border: none; z-index: 99999; background: white;
  `;
  document.body.appendChild(printFrame);

  const doc = printFrame.contentDocument || printFrame.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Bill ${uniqueId}</title>
        <style>
          * { box-sizing: border-box; }
          @page { 
            size: 58mm auto !important; 
            margin: 0 !important; 
            padding: 0 !important;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          body {
            margin: 0 !important; 
            padding: 8px !important; 
            width: 58mm !important; 
            font-size: 12px !important;
            font-family: 'Courier New', 'Lucida Console', monospace !important;
            line-height: 1.2 !important;
            background: white !important;
          }
          pre { 
            white-space: pre-wrap !important; 
            margin: 0 !important; 
            font-family: inherit !important;
          }
        </style>
      </head>
      <body>
        <pre>${billContent}</pre>
        <script>
          (function() {
            window.onload = function() {
              // Focus and print with delay for mobile
              setTimeout(() => {
                window.focus();
                window.print();
              }, 100);
              
              // Auto-cleanup after print (user prints or cancels)
              const cleanup = () => {
                setTimeout(() => {
                  if (window && window.close) window.close();
                }, 500);
              };
              
              window.onafterprint = cleanup;
              window.onbeforeprint = cleanup;
            };
          })();
        <\/script>
      </body>
    </html>
  `);
  doc.close();

  // ✅ FORCE CLEANUP REGARDLESS OF PRINT STATUS
  setTimeout(() => {
    const frame = document.getElementById(uniqueId);
    if (frame) frame.remove();
  }, 3000);
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


