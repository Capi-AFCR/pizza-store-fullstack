import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Order, OrderStatusHistory } from '../types';

interface KitchenDashboardProps {
  token: string;
}

const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ token }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ [orderId: number]: string }>({});

  const statusOptions = [
    { value: 'AP', label: t('client_dashboard.status_ap') },
    { value: 'RE', label: t('client_dashboard.status_re') }
  ];

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/kitchen', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      setError(t('kitchen_dashboard.error') + ' ' + (err.response?.data || err.message));
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, ...response.data.order, statusHistory: response.data.statusHistory } : order
        )
      );
      setError('');
    } catch (err: any) {
      setError(t('kitchen_dashboard.error_details') + ' ' + (err.response?.data?.error || err.message));
    }
  };

  const updateOrderStatus = async (orderId: number) => {
    const status = pendingStatus[orderId];
    if (!status) return;
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, ...response.data, statusHistory: [...(order.statusHistory || []), { id: Date.now(), orderId, status, updatedBy: 'kitchen', updatedAt: new Date().toISOString() }] } : order
        )
      );
      setPendingStatus(prev => ({ ...prev, [orderId]: '' }));
      setError('');
    } catch (err: any) {
      setError(t('kitchen_dashboard.error_update_status') + ' ' + (err.response?.data || err.message));
    }
  };

  useEffect(() => {
    fetchOrders();
    const socket = new SockJS('http://localhost:8080/ws/orders');
    const client = Stomp.over(socket);
    client.connect(
      { Authorization: `Bearer ${token}` },
      (frame: any) => {
        console.log('WebSocket connected:', frame);
        client.subscribe('/topic/orders', (message) => {
          const { order, statusHistory } = JSON.parse(message.body);
          console.log('Order update received:', order, statusHistory);
          setOrders(prevOrders =>
            prevOrders.map(o => (o.id === order.id ? { ...o, ...order, statusHistory } : o))
          );
        });
        setStompClient(client);
      },
      (error: unknown) => {
        console.error('WebSocket connection error:', error);
        setError(t('kitchen_dashboard.websocket_error'));
        setTimeout(() => client.connect({}, () => {}), 5000);
      }
    );

    return () => {
      if (stompClient?.connected) {
        stompClient.deactivate();
      }
    };
  }, [token, t]);

  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderDetails(orderId);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-4xl font-semibold text-gray-800 mb-6 animate-fade-in">{t('kitchen_dashboard.title')}</h2>
      {error && <p className="text-red-500 mb-6 font-medium bg-red-50 p-4 rounded-lg animate-fade-in">{error}</p>}
      {orders.length === 0 ? (
        <p className="text-gray-600 text-lg animate-fade-in">{t('kitchen_dashboard.no_orders')}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {orders.map(order => (
            <li key={order.id} className="py-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-medium">
                    {t('kitchen_dashboard.order_id')}: <span className="text-blue-600">{order.id}</span>
                  </p>
                  <p className="text-gray-600">
                    {t('kitchen_dashboard.order_status')}: <span className="text-blue-600">{t(`client_dashboard.status_${order.status.toLowerCase()}`)}</span>
                  </p>
                  {order.scheduledAt && (
                    <p className="text-gray-600">
                      {t('client_dashboard.scheduled_at')}: <span className="text-blue-600">{new Date(order.scheduledAt).toLocaleString()}</span>
                    </p>
                  )}
                  {order.customPizza && (
                    <p className="text-gray-600">
                      {t('client_dashboard.custom_pizza')}: <span className="text-blue-600">{t('client_dashboard.custom_pizza_yes')}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    {statusOptions.map(option => (
                      <div key={option.value} className="flex items-center mb-2">
                        <input
                          type="radio"
                          name={`status-${order.id}`}
                          value={option.value}
                          checked={pendingStatus[order.id!] === option.value}
                          onChange={(e) => setPendingStatus(prev => ({ ...prev, [order.id!]: e.target.value }))}
                          className="mr-2"
                        />
                        <label>{option.label}</label>
                      </div>
                    ))}
                    <button
                      onClick={() => updateOrderStatus(order.id!)}
                      disabled={!pendingStatus[order.id!]}
                      className="bg-green-600 text-white p-2 rounded-lg mt-2 hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {t('kitchen_dashboard.confirm_status')}
                    </button>
                  </div>
                  <button
                    onClick={() => toggleOrderDetails(order.id!)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    {expandedOrder === order.id ? t('kitchen_dashboard.hide_details') : t('kitchen_dashboard.show_details')}
                  </button>
                </div>
              </div>
              {expandedOrder === order.id && order.statusHistory && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('kitchen_dashboard.order_items')}</h4>
                  <ul className="list-disc pl-5 mb-4">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {order.customPizza && item.productId === 0 ? 'Custom Pizza' : `Product ID ${item.productId}`}: {item.quantity} x ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('kitchen_dashboard.status_history')}</h4>
                  <ul className="list-disc pl-5">
                    {order.statusHistory.map(history => (
                      <li key={history.id} className="text-gray-600">
                        {t(`client_dashboard.status_${history.status.toLowerCase()}`)} - {new Date(history.updatedAt).toLocaleString()} by {history.updatedBy}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KitchenDashboard;