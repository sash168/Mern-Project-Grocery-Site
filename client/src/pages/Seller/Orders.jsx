import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';

function Orders() {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg md:text-xl font-medium">Orders List</h2>
        {orders.map((order, index) => (
          <div 
            key={index} 
            className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5 justify-between p-4 md:p-5 max-w-full md:max-w-4xl rounded-md border border-gray-300 bg-white"
          >
            {/* Items Section */}
            <div className="flex flex-row md:flex-col gap-3 md:gap-5 md:max-w-xs w-full">
              <img className="w-14 h-14 md:w-16 md:h-16 object-cover flex-shrink-0" src={assets.box_icon} alt="boxIcon" />
              <div className="flex flex-col gap-1 truncate">
                {order.items.map((item, idx) => (
                  <p key={idx} className="font-medium text-sm md:text-base truncate">
                    {item.product.name} <span className="text-primary">x {item.quantity}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Address Section */}
            <div className="flex flex-col text-sm md:text-base text-black/60 w-full md:w-64 break-words">
              <p className='text-black/80 font-medium'>{order.address.firstName} {order.address.lastName}</p>
              <p>{order.address.street}, {order.address.city}</p>
              <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
              <p>{order.address.phone}</p>
            </div>

            {/* Amount */}
            <p className="font-medium text-lg my-2 md:my-auto">{currency}{order.amount}</p>

            {/* Payment Section */}
            <div className="flex flex-col text-sm md:text-base text-black/60 w-full md:w-48">
              <p>Method: {order.paymentType}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
