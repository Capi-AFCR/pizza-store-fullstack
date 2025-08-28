import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Please log in to view orders.');
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response: AxiosResponse<Order[]> = await axios.get('/api/orders/user', config);
        setOrders(response.data);
        setError('');
      } catch (err: any) {
        setError('Failed to fetch orders: ' + (err.response?.data || err.message));
        navigate('/login');
      }
    };
    fetchOrders();
  }, [navigate]);

  const statusNames: { [key: string]: string } = {
    PE: 'Pending',
    AP: 'Accepted - Preparing',
    RE: 'Ready',
    OW: 'On The Way',
    DN: 'Delivered - Not Paid',
    DY: 'Delivered - Paid',
    CA: 'Cancelled'
  };

  const statusStyles: { [key: string]: string } = {
    PE: 'bg-yellow-100 text-yellow-800',
    AP: 'bg-blue-100 text-blue-800',
    RE: 'bg-green-100 text-green-800',
    OW: 'bg-purple-100 text-purple-800',
    DN: 'bg-orange-100 text-orange-800',
    DY: 'bg-green-600 text-white',
    CA: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Order History</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {orders.length === 0 && !error && <p className="text-gray-600">No orders found.</p>}
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id || Math.random()} className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Order #{order.id || 'New'}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status]}`}>
                {statusNames[order.status] || order.status}
              </span>
            </div>
            <p className="text-gray-700"><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p className="text-gray-700 mb-2"><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-gray-700 font-semibold mb-2">Items:</p>
            <ul className="list-disc pl-5 mb-4">
              {order.items.map(item => (
                <li key={item.productId} className="text-gray-600">
                  Product ID: {item.productId}, Quantity: {item.quantity}, Unit Price: ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">Created By: {order.createdBy}</p>
            <p className="text-sm text-gray-500">Last Modified By: {order.modifiedBy}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;