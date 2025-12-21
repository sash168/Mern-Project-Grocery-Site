import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { toast } from 'sonner';
import { printInvoice, printInvoiceMobileFriendly, printThermalBill } from '../InvoiceHelper';
import { buildBillText } from '../buildBill';
import PrintBill from '../PrintBill';

function Orders() {
  const { currency, axios, navigate, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paidInputs, setPaidInputs] = useState({}); // key: order._id -> string/number
  const [searchName, setSearchName] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('all'); // all | delivered | pending
  const [filterPayment, setFilterPayment] = useState('all'); // all | unpaid | paid
  const [loadingDelivery, setLoadingDelivery] = useState({});

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 📅 Date filter logic
  useEffect(() => {
    let filtered = [...orders];
    const today = new Date();
    if (filterType === 'today') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (filterType === '7days') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      filtered = filtered.filter(order => new Date(order.createdAt) >= past7);
    } else if (filterType === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }
    // 🔍 Filter by Customer Name
    if (searchName.trim() !== '') {
      filtered = filtered.filter(order => {
        const name = order.address?.name?.toLowerCase() || '';
        return name.includes(searchName.toLowerCase());
      });
    }

    // 🚚 Delivery Filter
    if (filterDelivery === 'delivered') {
      filtered = filtered.filter(order => order.deliveryStatus === 'Delivered');
    } else if (filterDelivery === 'pending') {
      filtered = filtered.filter(order => order.deliveryStatus !== 'Delivered');
    }

    // 💰 Payment Filter
    if (filterPayment === 'unpaid') {
      filtered = filtered.filter(order => {
        const due = Number(order.dueAmount ?? (order.amount - (order.paidAmount || 0)));
        return due > 0;
      });
    } else if (filterPayment === 'paid') {
      filtered = filtered.filter(order => {
        const due = Number(order.dueAmount ?? (order.amount - (order.paidAmount || 0)));
        return due <= 0;
      });
    }

    setFilteredOrders(filtered);
  }, [
    filterType,
    startDate,
    endDate,
    orders,
    searchName,
    filterDelivery,
    filterPayment
  ]);

  const resetFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setSearchName('');
    setFilterDelivery('all');
    setFilterPayment('all');
    setFilteredOrders(orders);
  };


  const handlePaidAmount = async (order, paidAmountInput) => {
    const add = Number(paidAmountInput);
    const total = Number(order.amount);

    const currentPaid = Number(order.paidAmount ?? 0);
    const currentDue = (order.amount + (order.carriedFromPrevious || 0)) - (order.paidAmount || 0);

    if (isNaN(add) || add <= 0) {
      toast.error('Please enter a valid paid amount (greater than 0)');
      return;
    }

    if (add > currentDue) {
      toast.error(`You can only pay up to ₹${currentDue}`);
      return;
    }


    const newPaidAmount = currentPaid + add;
    const newDueAmount = Math.max(0, total - newPaidAmount);
    const paymentStatus = newDueAmount === 0 ? 'Fully Paid' : `Due ₹${newDueAmount}`;
    console.log("Updating payment:", { newPaidAmount, newDueAmount, paymentStatus, currentPaid, add, total });

    try {
      const { data } = await axios.put(`/api/order/updatePayment/${order._id}`, {
        paidAmount: add
      });
      console.log("Payment update response:", order.carriedFromPrevious);

      if (data.success) {
        toast.success('Payment updated successfully!');
        // clear local input for this order
        setPaidInputs(p => ({ ...p, [order._id]: '' }));
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update payment');
      console.error(err);
    }
  };

  const handleDeliveryStatus = async (orderId, status) => {
    if (loadingDelivery[orderId]) return; // prevent double clicks
    setLoadingDelivery(prev => ({ ...prev, [orderId]: true }));
    try {
      const { data } = await axios.put(`/api/order/updateDelivery/${orderId}`, {
        deliveryStatus: status
      });
      if (data.success) {
        toast.success('Delivery status updated!');
        fetchOrders();
      } else {
        toast.error(data.message || 'Failed to update delivery status');
      }
    } catch (err) {
      toast.error('Failed to update delivery status');
      console.error(err);
    } finally {
      setLoadingDelivery(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Add these 2 lines to your Orders component state
const [isPrinting, setIsPrinting] = useState(false);

// Add this print handler
const handlePrint = (order) => {
  setIsPrinting(true); // Enter print mode
  setTimeout(() => {
    window.print(); // Trigger print
    setTimeout(() => setIsPrinting(false), 1000); // Exit print mode
  }, 100);
};


  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg md:text-xl font-medium flex items-center justify-between">
          Orders List
          <span className="text-sm md:text-base text-gray-500">
            {filteredOrders.length} Orders
          </span>
        </h2>

        {/* 🔘 Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`px-3 py-1 rounded ${filterType === 'today' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => setFilterType('today')}
          >
            Today
          </button>
          <button
            className={`px-3 py-1 rounded ${filterType === '7days' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => setFilterType('7days')}
          >
            Last 7 Days
          </button>
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setFilterType('custom'); }}
            className="px-2 py-1 border rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setFilterType('custom'); }}
            className="px-2 py-1 border rounded"
          />
          <button
            onClick={resetFilters}
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-black"
          >
            Reset
          </button>
        </div>

        {/* 🔍 Search + Additional Filters */}
        {/* 🔍 Search by Name */}
        <input
          type="text"
          placeholder="Search customer"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-2 py-1 border rounded"
        />

        {/* 🚚 Delivery filter */}
        <select
          value={filterDelivery}
          onChange={(e) => setFilterDelivery(e.target.value)}
          className="px-3 py-1 border rounded"
        >
          <option value="all">All Deliveries</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
        </select>

        {/* 💰 Payment filter */}
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-3 py-1 border rounded"
        >
          <option value="all">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Fully Paid</option>
        </select>


        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5 justify-between p-4 md:p-5 max-w-full md:max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* 🧾 Items */}
            <div className="flex flex-row md:flex-col gap-3 md:gap-5 md:max-w-xs w-full">
              <img
                className="w-14 h-14 md:w-16 md:h-16 object-cover flex-shrink-0"
                src={assets.box_icon}
                alt="boxIcon"
              />
              <div className="flex flex-col gap-1 truncate">
                {order.items.map((item, idx) => (
                  <p
                    key={idx}
                    className={`font-medium text-sm md:text-base truncate ${!item.product ? 'text-red-500' : ''}`}
                    onClick={() => {
                      navigate(`/products/${item.product.category.toLowerCase()}/${item.product._id}`);
                      scrollTo(0, 0);
                    }}
                  >
                    {item.product?.name || 'Deleted Product'} x {item.quantity} x {currency}{item.product?.offerPrice * item.quantity}
                  </p>
                ))}
              </div>
            </div>

            {/* 🏠 Address + 💰 Amount */}
            <div className="flex flex-col text-sm md:text-base text-black/60 w-full md:w-64 break-words">
              {order.address ? (
                <>
                  <p className="text-black/80 font-medium">
                    {order.address?.name}
                  </p>

                  <p>
                    {order.address?.day} - {order.address?.street}
                  </p>

                  {order.address?.addressInfo && (
                    <p>{order.address?.addressInfo}</p>
                  )}

                  <p>{order.address?.zipcode}</p>
                  <p>{order.address?.phone}</p>

                </>
              ) : (
                <p className="text-red-500 font-medium">Address Deleted / Unavailable</p>
              )}
              {/* 💰 Total Amount */}
              <p className="font-semibold text-lg text-black/60 mt-2">
                Total: {currency}{order.amount}
              </p>
              {order.carriedFromPrevious > 0 && (
                <p className="text-sm text-red-600">
                  Past Due Added: +{currency}{order.carriedFromPrevious}
                </p>
              )}

            </div>

            {/* 📦 Payment + Delivery Info */}
            <div className="flex flex-col text-sm md:text-base text-black/70 w-full md:w-60 space-y-2">
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>
                Delivery Day: 
                <span className="text-black/70 font-medium">
                   {order.address ? `${order.address.day} - ${order.address.street}` : "N/A"}
                </span>
              </p>


              <p>
                Payment:
                <span
                  className={`ml-1 font-medium ${order.paymentStatus?.includes('Due') ? 'text-orange-500' : order.paymentStatus === 'Fully Paid' ? 'text-green-600' : 'text-red-500'}`}
                >
                  {order.paymentStatus || 'Pending'}
                </span>
              </p>


              {/* 💵 Paid Amount Input */}
              {order.paymentStatus !== 'Fully Paid' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    // limit max to current remaining due
                    max={
                      (order.amount + (order.carriedFromPrevious || 0)) 
                      - (order.paidAmount || 0)
                    }
                    placeholder="Paid ₹"
                    className="border p-1 rounded w-24"
                    value={paidInputs[order._id] ?? ''}
                    onChange={e => setPaidInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                  />

                  {/* Save (partial / any amount <= remaining due) */}
                  <button
                    onClick={() => handlePaidAmount(order, paidInputs[order._id])}
                    className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Save
                  </button>

                  {/* Paid = pay full remaining due */}
                  <button
                    onClick={() => {
                      const remainingDue = Number(order.dueAmount ?? (order.amount - (order.paidAmount || 0)));
                      // call with remaining due (only if > 0)
                      if (remainingDue <= 0) {
                        toast.error('Nothing to pay — already fully paid');
                        return;
                      }
                      handlePaidAmount(order, remainingDue);
                    }}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Paid
                  </button>
                </div>
              )}


              {/* 🚚 Delivery */}
              <p>
                Delivery:
                <span className={`ml-1 font-medium ${order.deliveryStatus === 'Delivered' ? 'text-green-600' : 'text-red-500'}`}>
                  {order.deliveryStatus || 'Pending'}
                </span>
              </p>

              {/* Hide Delivered Button if already Delivered */}
              {order.deliveryStatus !== 'Delivered' && (
                <button
                  onClick={() => handleDeliveryStatus(order._id, 'Delivered')}
                  disabled={loadingDelivery[order._id]}
                  className="text-xs px-2 py-1 bg-blue-500 rounded text-white hover:bg-blue-600"
                >
                  {loadingDelivery[order._id] ? 'Processing...' : 'Mark Delivered'}
                </button>
              )}

              {isPrinting ? (
                  // 🧾 PRINT BILL ONLY (shows during print)
                  <div className="print-bill-container">
                    <pre style={{whiteSpace: 'pre-wrap'}}>
                S3 Retail Hub
                {`=${'='.repeat(23)}`}
                Invoice: {new Date().getTime()}
                Date: {new Date().toLocaleDateString("en-IN")}
                Customer: {order.address?.name || "Guest"}
                {`=${'='.repeat(23)}`}
                {order.items.map(item => {
                  const name = (item.product?.name || 'Item').slice(0, 20);
                  const price = (item.product?.offerPrice || 0) * (item.quantity || 1);
                  return `${name.padEnd(20)} x${(item.quantity || 1).toString().padStart(2)} ₹${price.toFixed(2)}\n`;
                }).join('')}
                {`=${'='.repeat(23)}`}
                Total: ₹{order.amount?.toFixed(2)}
                {`=${'='.repeat(23)}`}
                Thank you! Visit again
                    </pre>
                  </div>
                ) : (
                  // 🖨 Normal Print Button (shows normally)
                  <button
                    onClick={() => handlePrint(order)}
                    className="mt-2 px-3 py-1 rounded bg-primary text-white hover:bg-dull-primary text-sm"
                  >
                    Print Invoice
                  </button>
                )}


            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;