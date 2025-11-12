import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { printInvoice } from '../InvoiceHelper';

function Orders() {
  const { currency, axios, navigate, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    setFilteredOrders(filtered);
  }, [filterType, startDate, endDate, orders]);

  const resetFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setFilteredOrders(orders);
  };

  // ✅ Handle Paid Amount entry
  const handlePaidAmount = async (order, paidAmountInput) => {
    const paidAmount = Number(paidAmountInput);
    const total = Number(order.amount);

    if (isNaN(paidAmount) || paidAmount < 0) {
      toast.error('Please enter a valid paid amount');
      return;
    }
    if (paidAmount > total) {
      toast.error('Paid amount cannot exceed total amount');
      return;
    }

    const dueAmount = total - paidAmount;
    const paymentStatus = dueAmount === 0 ? 'Fully Paid' : `Due ₹${dueAmount}`;

    try {
      const { data } = await axios.put(`/api/order/updatePayment/${order._id}`, {
        paymentStatus,
        dueAmount,
      });
      if (data.success) {
        toast.success('Payment updated successfully!');
        fetchOrders();
      }
    } catch {
      toast.error('Failed to update payment');
    }
  };

  // ✅ Handle Delivery Status
  const handleDeliveryStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/api/order/updateDelivery/${orderId}`, {
        deliveryStatus: status
      });
      if (data.success) {
        toast.success('Delivery status updated!');
        fetchOrders();
      }
    } catch {
      toast.error('Failed to update delivery status');
    }
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
                    {item.product?.name || 'Deleted Product'} x {item.quantity}
                  </p>
                ))}
              </div>
            </div>

            {/* 🏠 Address + 💰 Amount */}
            <div className="flex flex-col text-sm md:text-base text-black/60 w-full md:w-64 break-words">
              {order.address ? (
                <>
                  <p className="text-black/80 font-medium">
                    {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <p>{order.address?.street} - {order.address?.city}</p>
                  <p>{order.address?.state}, {order.address?.zipcode}, {order.address?.country}</p>
                  <p>{order.address?.phone}</p>
                </>
              ) : (
                <p className="text-red-500 font-medium">Address Deleted / Unavailable</p>
              )}
              {/* 💰 Total Amount */}
              <p className="font-semibold text-lg text-black/60 mt-2">
                Total: {currency}{order.amount}
              </p>
            </div>

            {/* 📦 Payment + Delivery Info */}
            <div className="flex flex-col text-sm md:text-base text-black/70 w-full md:w-60 space-y-2">
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Delivery Day: <span className="text-green-600 font-medium">{order.address?.day || 'N/A'}</span></p>

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
                    max={order.amount}
                    placeholder="Paid ₹"
                    className="border p-1 rounded w-24"
                    onChange={e => order.tempPaid = e.target.value}
                  />
                  <button
                    onClick={() => handlePaidAmount(order, order.tempPaid)}
                    className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handlePaidAmount(order, order.amount)}
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
                  className="text-xs px-2 py-1 bg-blue-500 rounded text-white hover:bg-blue-600"
                >
                  Mark Delivered
                </button>
              )}

              {/* 🖨 Print Invoice */}
              <button
                onClick={() => printInvoice(order, currency, user, axios, index + 1)}
                className="mt-2 px-3 py-1 rounded bg-primary text-white hover:bg-dull-primary text-sm"
              >
                Print Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;