import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Please log in to manage orders.');
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response: AxiosResponse<Order[]> = await axios.get('/api/orders', config);
        setOrders(response.data);
        setError('');
      } catch (err: any) {
        setError('Failed to fetch orders: ' + (err.response?.data || err.message));
        navigate('/login');
      }
    };
    fetchOrders();
  }, [navigate]);

  const handleStatusChange = async (orderId: number, status: 'PE' | 'AP' | 'RE' | 'OW' | 'DN' | 'DY' | 'CA') => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/orders/${orderId}`, { status }, config);
      setOrders(orders.map(order => order.id === orderId ? { ...order, status } : order));
      setError('');
    } catch (err: any) {
      setError('Failed to update order status: ' + (err.response?.data || err.message));
    }
  };

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

  const getAllowedStatuses = (currentStatus: string) => {
    switch (role) {
      case 'ROLE_A':
        return ['PE', 'AP', 'RE', 'OW', 'DN', 'DY', 'CA'];
      case 'ROLE_K':
        return currentStatus === 'PE' ? ['AP'] : currentStatus === 'AP' ? ['RE', 'CA'] : [];
      case 'ROLE_D':
        return currentStatus === 'RE' ? ['OW'] : currentStatus === 'OW' ? ['DY', 'CA'] : [];
      case 'ROLE_W':
        return currentStatus === 'PE' ? ['CA'] : currentStatus === 'RE' ? ['DN'] : currentStatus === 'DN' ? ['DY', 'CA'] : [];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Orders</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-700"><strong>User ID:</strong> {order.userId}</p>
                <p className="text-gray-700"><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
                <p className="text-gray-700"><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500"><strong>Created By:</strong> {order.createdBy}</p>
                <p className="text-sm text-gray-500"><strong>Last Modified By:</strong> {order.modifiedBy}</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold mb-2">Items:</p>
                <ul className="list-disc pl-5">
                  {order.items.map(item => (
                    <li key={item.productId} className="text-gray-600">
                      Product ID: {item.productId}, Qty: {item.quantity}, Unit Price: ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Update Status</label>
              {order.status === 'DY' || order.status === 'CA' ? (
                <p className="text-gray-500 text-sm">Status cannot be changed (order is {statusNames[order.status]})</p>
              ) : (
                <div className="relative group">
                  <select
                    value={order.status}
                    onChange={(e) => order.id !== undefined && handleStatusChange(order.id, e.target.value as 'PE' | 'AP' | 'RE' | 'OW' | 'DN' | 'DY' | 'CA')}
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    disabled={order.id === undefined || getAllowedStatuses(order.status).length === 0}
                  >
                    {getAllowedStatuses(order.status).map(status => (
                      <option key={status} value={status}>{statusNames[status]}</option>
                    ))}
                  </select>
                  {(order.id === undefined || getAllowedStatuses(order.status).length === 0) && (
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-10">
                      {order.id === undefined ? 'Order ID not available' : 'No valid status transitions for your role'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;