import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Order } from '../types';

const AdminOrders: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';

  const refreshAccessToken = async () => {
    try {
      const email = localStorage.getItem('email') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      return response.data.accessToken;
    } catch (err: any) {
      setError(t('admin_orders.error_token'));
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      navigate('/login');
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError(t('admin_orders.error_login'));
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<Order[]> = await axios.get('/api/orders', config);
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Order[]> = await axios.get('/api/orders', config);
          setOrders(response.data);
          setError('');
        }
      } else {
        setError(t('admin_orders.error_fetch') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const handleStatusChange = async (orderId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError(t('admin_orders.error_login'));
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newStatus = selectedStatuses.get(orderId) as 'PE' | 'AP' | 'RE' | 'OW' | 'DN' | 'DY' | 'CA';
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      setSelectedStatuses(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          await axios.put(`/api/orders/${orderId}`, { status: selectedStatuses.get(orderId) }, config);
          setOrders(orders.map(order => order.id === orderId ? { ...order, status: selectedStatuses.get(orderId) as 'PE' | 'AP' | 'RE' | 'OW' | 'DN' | 'DY' | 'CA' } : order));
          setSelectedStatuses(prev => {
            const newMap = new Map(prev);
            newMap.delete(orderId);
            return newMap;
          });
          setError('');
        }
      } else {
        setError(t('admin_orders.error_update') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const handleSelectStatus = (orderId: number, status: string) => {
    setSelectedStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(orderId, status);
      return newMap;
    });
  };

  const statusNames: { [key: string]: string } = {
    PE: t('admin_orders.status_pe', 'Pending'),
    AP: t('admin_orders.status_ap', 'Accepted - Preparing'),
    RE: t('admin_orders.status_re', 'Ready'),
    OW: t('admin_orders.status_ow', 'On The Way'),
    DN: t('admin_orders.status_dn', 'Delivered - Not Paid'),
    DY: t('admin_orders.status_dy', 'Delivered - Paid'),
    CA: t('admin_orders.status_ca', 'Cancelled')
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('admin_orders.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {orders.length === 0 && !error && <p className="text-gray-600">{t('admin_orders.no_orders')}</p>}
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id || Math.random()} className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('admin_orders.order_id')} {order.id || 'New'}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status]}`}>
                {statusNames[order.status] || order.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-700"><strong>{t('admin_orders.user_id', 'User ID')}:</strong> {order.userId}</p>
                <p className="text-gray-700"><strong>{t('admin_orders.total', 'Total Price')}:</strong> ${order.totalPrice.toFixed(2)}</p>
                <p className="text-gray-700"><strong>{t('admin_orders.created_at', 'Created At')}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500"><strong>{t('admin_orders.created_by', 'Created By')}:</strong> {order.createdBy}</p>
                <p className="text-sm text-gray-500"><strong>{t('admin_orders.modified_by', 'Last Modified By')}:</strong> {order.modifiedBy}</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold mb-2">{t('admin_orders.items', 'Items')}:</p>
                <ul className="list-disc pl-5">
                  {order.items.map(item => (
                    <li key={item.productId} className="text-gray-600">
                      {t('admin_orders.product_id', 'Product ID')}: {item.productId}, {t('admin_orders.quantity', 'Qty')}: {item.quantity}, {t('admin_orders.unit_price', 'Unit Price')}: ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin_orders.update_status')}</label>
              {order.status === 'DY' || order.status === 'CA' ? (
                <p className="text-gray-500 text-sm">{t('admin_orders.status_locked', 'Status cannot be changed (order is {status})', { status: statusNames[order.status] })}</p>
              ) : (
                <div className="relative group">
                  <div className="flex flex-wrap gap-4 mb-4">
                    {getAllowedStatuses(order.status).map(status => (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`status-${order.id || 'new'}`}
                          value={status}
                          checked={order.id !== undefined && selectedStatuses.get(order.id) === status}
                          onChange={() => order.id !== undefined && handleSelectStatus(order.id, status)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          disabled={order.id === undefined}
                        />
                        <span className="text-gray-700">{statusNames[status]}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => order.id !== undefined && handleStatusChange(order.id)}
                    className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={order.id === undefined || !selectedStatuses.get(order.id) || selectedStatuses.get(order.id) === order.status}
                  >
                    {t('admin_orders.update_status')}
                  </button>
                  {(order.id === undefined || getAllowedStatuses(order.status).length === 0) && (
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 mt-2">
                      {order.id === undefined ? t('admin_orders.error_no_id', 'Order ID not available') : t('admin_orders.error_no_transitions', 'No valid status transitions for your role')}
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