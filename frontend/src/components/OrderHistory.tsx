import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Order } from '../types';

const OrderHistory: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError(t('order_history.error_login'));
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response: AxiosResponse<Order[]> = await axios.get('/api/orders/user', config);
        setOrders(response.data);
        setError('');
      } catch (err: any) {
        setError(t('order_history.error_fetch') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      }
    };
    fetchOrders();
  }, [navigate]);

  const statusNames: { [key: string]: string } = {
    PE: t('order_history.status_pe', 'Pending'),
    AP: t('order_history.status_ap', 'Accepted - Preparing'),
    RE: t('order_history.status_re', 'Ready'),
    OW: t('order_history.status_ow', 'On The Way'),
    DN: t('order_history.status_dn', 'Delivered - Not Paid'),
    DY: t('order_history.status_dy', 'Delivered - Paid'),
    CA: t('order_history.status_ca', 'Cancelled')
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('order_history.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {orders.length === 0 && !error && <p className="text-gray-600">{t('order_history.no_orders')}</p>}
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id || Math.random()} className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('order_history.order_id')} {order.id || t('order_history.new_order', 'New')}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status]}`}>
                {statusNames[order.status] || order.status}
              </span>
            </div>
            <p className="text-gray-700"><strong>{t('order_history.total')}:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p className="text-gray-700 mb-2"><strong>{t('order_history.created_at')}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-gray-700 font-semibold mb-2">{t('order_history.items')}:</p>
            <ul className="list-disc pl-5 mb-4">
              {order.items.map(item => (
                <li key={item.productId} className="text-gray-600">
                  {t('order_history.product_id')}: {item.productId}, {t('order_history.quantity')}: {item.quantity}, {t('order_history.unit_price')}: ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">{t('order_history.created_by')}: {order.createdBy}</p>
            <p className="text-sm text-gray-500">{t('order_history.modified_by')}: {order.modifiedBy}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;