import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

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

  const handleStatusChange = async (orderId: number, status: 'PE' | 'AP' | 'OW' | 'DN' | 'DY' | 'CA') => {
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
    OW: 'On The Way',
    DN: 'Delivered - Not Paid',
    DY: 'Delivered - Paid',
    CA: 'Cancelled'
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 && !error && <p>No orders found.</p>}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id || Math.random()} className="border p-4 rounded">
            <p><strong>Order ID:</strong> {order.id || 'New'}</p>
            <p><strong>User ID:</strong> {order.userId}</p>
            <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> {statusNames[order.status] || order.status}</p>
            <p><strong>Items:</strong></p>
            <ul className="list-disc pl-5">
              {order.items.map(item => (
                <li key={item.productId}>
                  Product ID: {item.productId}, Quantity: {item.quantity}, Unit Price: ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <label className="block text-sm font-medium">Update Status</label>
              {order.status === 'DY' || order.status === 'CA' ? (
                <p className="text-gray-500 text-sm">Status cannot be changed (order is {statusNames[order.status]})</p>
              ) : (
                <select
                  value={order.status}
                  onChange={(e) => order.id !== undefined && handleStatusChange(order.id, e.target.value as 'PE' | 'AP' | 'OW' | 'DN' | 'DY' | 'CA')}
                  className="border p-2 rounded"
                  disabled={order.id === undefined}
                >
                  <option value="PE">Pending</option>
                  <option value="AP">Accepted - Preparing</option>
                  <option value="OW">On The Way</option>
                  <option value="DN">Delivered - Not Paid</option>
                  <option value="DY">Delivered - Paid</option>
                  <option value="CA">Cancelled</option>
                </select>
              )}
            </div>
            <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;