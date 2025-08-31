import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Order } from '../types';

const DeliveryDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

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
      setError(t('delivery_dashboard.error_token'));
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
        setError(t('delivery_dashboard.error_login'));
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<Order[]> = await axios.get('/api/orders/delivery', config);
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Order[]> = await axios.get('/api/orders/delivery', config);
          setOrders(response.data);
          setError('');
        }
      } else {
        setError(t('delivery_dashboard.error_fetch') + ' ' + (err.response?.data || err.message));
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
        setError(t('delivery_dashboard.error_login'));
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newStatus = selectedStatuses.get(orderId) as 'OW' | 'DY' | 'CA';
      await axios.put(`/api/orders/${orderId}`, { status: newStatus }, config);
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
          setOrders(orders.map(order => order.id === orderId ? { ...order, status: selectedStatuses.get(orderId) as 'OW' | 'DY' | 'CA' } : order));
          setSelectedStatuses(prev => {
            const newMap = new Map(prev);
            newMap.delete(orderId);
            return newMap;
          });
          setError('');
        }
      } else {
        setError(t('delivery_dashboard.error_update') + ' ' + (err.response?.data || err.message));
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
    RE: t('delivery_dashboard.status_re', 'Ready'),
    OW: t('delivery_dashboard.status_ow', 'On The Way'),
    DY: t('delivery_dashboard.status_dy', 'Delivered - Paid'),
    CA: t('delivery_dashboard.status_ca', 'Cancelled')
  };

  const statusStyles: { [key: string]: string } = {
    RE: 'bg-green-100 text-green-800',
    OW: 'bg-purple-100 text-purple-800',
    DY: 'bg-green-600 text-white',
    CA: 'bg-red-100 text-red-800'
  };

  const getAllowedStatuses = (currentStatus: string) => {
    return currentStatus === 'RE' ? ['OW'] : currentStatus === 'OW' ? ['DY', 'CA'] : [];
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('delivery_dashboard.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {orders.length === 0 && !error && <p className="text-gray-600">{t('delivery_dashboard.no_orders')}</p>}
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id || Math.random()} className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('delivery_dashboard.order_id')} {order.id || 'New'}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status]}`}>
                {statusNames[order.status] || order.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-700"><strong>{t('delivery_dashboard.user_id')}:</strong> {order.userId}</p>
                <p className="text-gray-700"><strong>{t('delivery_dashboard.total')}:</strong> ${order.totalPrice.toFixed(2)}</p>
                <p className="text-gray-700"><strong>{t('delivery_dashboard.created_at')}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-500"><strong>{t('delivery_dashboard.created_by')}:</strong> {order.createdBy}</p>
                <p className="text-sm text-gray-500"><strong>{t('delivery_dashboard.modified_by')}:</strong> {order.modifiedBy}</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold mb-2">{t('delivery_dashboard.items')}:</p>
                <ul className="list-disc pl-5">
                  {order.items.map(item => (
                    <li key={item.productId} className="text-gray-600">
                      {t('delivery_dashboard.product_id')}: {item.productId}, {t('delivery_dashboard.quantity')}: {item.quantity}, {t('delivery_dashboard.unit_price')}: ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('delivery_dashboard.update_status')}</label>
              {order.status === 'DY' || order.status === 'CA' ? (
                <p className="text-gray-500 text-sm">{t('delivery_dashboard.status_locked', { status: statusNames[order.status] })}</p>
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
                    {t('delivery_dashboard.update_status')}
                  </button>
                  {(order.id === undefined || getAllowedStatuses(order.status).length === 0) && (
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 mt-2">
                      {order.id === undefined ? t('delivery_dashboard.error_no_id') : t('delivery_dashboard.error_no_transitions')}
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

export default DeliveryDashboard;