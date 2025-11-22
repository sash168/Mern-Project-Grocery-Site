import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { downloadInvoicePDF, printInvoice } from './InvoiceHelper';

function MyOrder() {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user, navigate } = useAppContext();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('api/order/user');
      if (data.success) setMyOrders(data.orders);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { if(user) fetchMyOrders(); }, [user]);

  return (
    <div className='mt-16 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My Orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md md:max-w-lg relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInvoiceModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 font-bold">X</button>
            <h2 className="text-xl font-medium mb-3">Invoice Preview</h2>

            <div className="bg-white p-4 rounded border border-gray-300 hover:bg-gray-50 transition">
              {/* Invoice Number + Date */}
              {selectedOrder && (() => {
                const orderDate = new Date(selectedOrder.createdAt);
                const invoiceNo = (() => {
                  const datePart = `${String(orderDate.getDate()).padStart(2, '0')}${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                  const uniquePart = selectedOrder._id.slice(-4).toUpperCase(); // last 4 chars of MongoDB ID for uniqueness
                  return `${datePart}${uniquePart}`;
                })();

                return (
                  <>
                    <p className="text-sm">Invoice No: INV{invoiceNo}</p>
                    <p className="text-sm">Date: {orderDate.toLocaleDateString()}</p>
                  </>
                )
              })()}

              <hr className="my-2" />

              {selectedOrder.items.map((item,index) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span onClick={() => {
                    navigate(`/products/${item.product.category.toLowerCase()}/${item.product._id}`);
                    scrollTo(0, 0);
                  }}>{item.product?.name || item.name || "Deleted Product"} (x{item.quantity})</span>
                  <span>{currency}{((item.product?.offerPrice || item.offerPrice || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <hr className="my-2" />
              <p className="flex justify-between font-medium text-base">
                <span>Total Quantity:</span>
                <span>{selectedOrder.items.reduce((sum,i)=>sum+i.quantity,0)}</span>
              </p>
              <p className="flex justify-between font-bold text-lg mt-2">
                <span>Subtotal:</span>
                <span>{currency}{selectedOrder.amount.toFixed(2)}</span>
              </p>

              <div className="flex gap-2 mt-3">
                <button onClick={() => downloadInvoicePDF(selectedOrder, currency, user)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}


  {/* Orders List */}
{myOrders.map((order, index) => (
  <div key={index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
    {/* Top section: Order info nicely formatted */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center text-gray-500 md:font-medium mb-4 w-full">
      <div className="flex flex-col md:flex-row w-full">
        <span className="flex-1 sm:text-left md:text-left">Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
        {order.address && (
        <span className="flex-1 sm:text-left md:text-right">
          Delivery Day: <span className="font-medium">{order.address.day}</span>
          {order.address.street ? ` — ${order.address.street}` : ''}
        </span>
        )}
        <span className="flex-1 sm:text-left md:text-right">Total Amount: {currency}{order.amount}</span>
      </div>
    </div>



    {order.items.map((item, idx) => (
  <div
    key={idx}
    className={`relative bg-white text-gray-500/70 ${
      order.items.length !== idx + 1 && "border-b"
    } border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between pt-4 pb-4 sm:gap-8 w-full`}
  >
    <div
      className="flex items-center mb-4 md:mb-0 cursor-pointer"
      onClick={() => {
        navigate(`/products/${item.product.category.toLowerCase()}/${item.product._id}`);
        scrollTo(0, 0);
      }}
    >
      <div className="bg-primary/10 p-4 rounded-lg">
        <img
          src={item.product?.image?.[0] || assets.box_icon}
          alt={item.product?.name || "Deleted Product"}
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
        />
      </div>
      <div className="ml-4 flex flex-col">
        <h2 className="text-xl font-medium text-gray-800">{item.product?.name || "Deleted Product"}</h2>
        <p>Category: {item.product?.category || "N/A"}</p>
        <p>Quantity: {item.quantity}</p>

        {/* Amount visible below on small screens */}
        <p className="text-primary text-lg font-medium mt-1 sm:hidden">
          Amount: {currency}{((item.product?.offerPrice || 0) * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>

    {/* Amount visible on md+ screens */}
    <div className="text-primary text-lg font-medium flex items-center mt-2 sm:mt-0 hidden sm:flex">
      Amount: {currency}{((item.product?.offerPrice || 0) * item.quantity).toFixed(2)}
    </div>
  </div>
))}


    <button onClick={() => { setSelectedOrder(order); setShowInvoiceModal(true); }}
            className="bg-gray-300 px-2 py-1 rounded mt-2 text-gray-600 hover:bg-gray-400 transition">
      View Invoice
    </button>
  </div>
))}


    </div>
  );
}

export default MyOrder;
