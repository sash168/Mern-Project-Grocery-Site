import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { downloadInvoicePDF, printInvoice } from './InvoiceHelper';

function MyOrder() {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();
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
              <p className="text-xs">Invoice No: INV{new Date(selectedOrder.createdAt).getTime()}</p>
              <p className="text-sm">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              <p className="text-sm font-medium">Customer: {selectedOrder.customerName || user?.name || "Guest"}</p>
              <p className="text-sm">Contact: {selectedOrder.customerNumber || "N/A"}</p>
              <hr className="my-2" />

              {selectedOrder.items.map((item,index) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span>{item.product?.name || item.name || "Deleted Product"} (x{item.quantity})</span>
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
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Download PDF
                </button>

                <button onClick={() => printInvoice(selectedOrder, currency, user)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Print Bill
                </button>              
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {myOrders.map((order,index)=>(
        <div key={index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
          <p className='flex justify-between md:items-center text-gray-500 md:font-medium max-md:flex-col'>
            <span>OrderId: {order._id}</span>
            <span>Payment: {order.paymentType}</span>
            <span>Total Amount: {currency}{order.amount}</span>
          </p>
          <div className="text-sm text-gray-700 mt-2 mb-3 font-medium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <p>Customer Name: {order.customerName || user?.name || "Guest"}</p>
            <p>Customer Number: {order.customerNumber || "N/A"}</p>
          </div>

          {order.items.map((item, idx) => (
            <div key={idx} className={`relative bg-white text-gray-500/70 ${order.items.length !== idx+1 && "border-b"} border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between pt-4 pb-4 sm:gap-8 w-full`}>
              <div className='flex items-center mb-4 md:mb-0'>
                <div className='bg-primary/10 p-4 rounded-lg'>
                  <img src={item.product?.image?.[0] || assets.box_icon} alt={item.product?.name || "Deleted Product"} className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded'/>
                </div>
                <div className='ml-4'>
                  <h2 className='text-xl font-medium text-gray-800'>{item.product?.name || "Deleted Product"}</h2>
                  <p>Category: {item.product?.category || "N/A"}</p>
                </div>
              </div>

              <div className='flex flex-col justify-center sm:ml-8 mb-4 sm:mb-0'>
                <p>Quantity: {item.quantity}</p>
                <p>Status: {order.status}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>

              <div className='text-primary text-lg font-medium flex items-center mt-2 sm:mt-0'>
                Amount: {currency}{((item.product?.offerPrice || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <button onClick={()=>{setSelectedOrder(order); setShowInvoiceModal(true);}}
                  className="bg-gray-300 px-2 py-1 rounded mt-2 text-gray-600 hover:bg-gray-400 transition">View Invoice</button>
        </div>
      ))}
    </div>
  );
}

export default MyOrder;
