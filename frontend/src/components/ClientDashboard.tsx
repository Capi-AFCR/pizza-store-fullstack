import React, { useState, useEffect, useContext } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { Product, CartItem, Order, OrderStatusUpdate } from '../types';
import Cart from './Cart';

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('name-asc');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('accessToken') || '';

  const categoryMap: { [key: string]: string } = {
    AP: t('category.appetizers'),
    MC: t('category.main_courses'),
    SD: t('category.sides'),
    DR: t('category.drinks'),
    DE: t('category.desserts')
  };

  const statusMap: { [key: string]: string } = {
    PE: t('status.pending'),
    AP: t('status.preparing'),
    RE: t('status.ready'),
    OW: t('status.on_the_way'),
    DN: t('status.delivered'),
    DY: t('status.delayed'),
    CA: t('status.cancelled')
  };

  const statusProgress: { [key: string]: number } = {
    PE: 20,
    AP: 40,
    RE: 60,
    OW: 80,
    DN: 100,
    DY: 50,
    CA: 0
  };

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
      setError(t('client_dashboard.error') + ' ' + (err.response?.data || err.message));
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      navigate('/login');
      return null;
    }
  };

  const fetchProducts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
          setProducts(response.data);
          setError('');
        }
      } else {
        setError(t('client_dashboard.error') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<Order[]> = await axios.get('/api/orders/user', config);
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Order[]> = await axios.get('/api/orders/user', config);
          setOrders(response.data);
          setError('');
        }
      } else {
        setError(t('client_dashboard.error') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (token && role === 'ROLE_C') {
        await fetchProducts();
        await fetchOrders();
      } else {
        navigate('/login');
      }
    };
    initialize();
  }, [token, role, navigate]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws/orders/info');
    const client = Stomp.over(socket);
    client.connect({}, (frame: any) => {
      console.log('WebSocket connected:', frame);
      client.subscribe('/topic/orders', (message) => {
        console.log('Order update:', JSON.parse(message.body));
        fetchOrders();
      });
    }, (error: unknown) => {
      console.error('WebSocket error:', error);
      setError(t('client_dashboard.websocket_error'));
    });
    setStompClient(client);

    return () => {
      if (client.connected) {
        client.disconnect(() => {
          console.log('WebSocket disconnected');
        });
      }
    };
  }, [t]);

  const handleCheckout = async (cartItems : CartItem[]) => {
    try {
      if (!token) {
        setError('Please log in to place an order.');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const orderItems = cartItems.map((item: CartItem) => ({
        productId: item.id!,
        quantity: item.quantity,
        price: item.price
      }));
      const payload = { items: orderItems };
      console.log('Submitting order with payload:', payload, 'Role:', role, 'Token:', token.substring(0, 10) + '...');
      const response = await axios.post('/api/orders', payload, config);
      console.log('Order created successfully:', response.data);
      setError('');
    } catch (err: any) {
      console.error('Checkout failed:', err.response?.data || err.message, 'Status:', err.response?.status, 'Headers:', err.response?.headers);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const orderItems = cartItems.map((item: CartItem) => ({
            productId: item.id!,
            quantity: item.quantity,
            price: item.price
          }));
          const payload = { items: orderItems };
          console.log('Retrying order submission with new token:', newToken.substring(0, 10) + '...');
          const response = await axios.post('/api/orders', payload, config);
          console.log('Order created successfully after refresh:', response.data);
          setError('');
        }
      } else {
        setError('Failed to place order: ' + (err.response?.data || err.message));
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.id !== undefined) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        isActive: product.isActive,
        imageUrl: product.imageUrl,
        createdBy: product.createdBy,
        modifiedBy: product.modifiedBy,
        createdAt: product.createdAt,
        modifiedAt: product.modifiedAt,
        quantity: 1
      });
    }
  };

  const filteredProducts = products
    .filter(product => product.id !== undefined && (categoryFilter === 'all' || product.category === categoryFilter))
    .sort((a, b) => {
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('client_dashboard.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4">
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">{t('client_dashboard.track_orders')}</h3>
            {orders.length === 0 ? (
              <p className="text-gray-600">{t('client_dashboard.no_orders')}</p>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4 shadow-md">
                    <h4 className="text-lg font-semibold">{t('client_dashboard.order_id')} {order.id}</h4>
                    <p className="text-gray-600">{t('client_dashboard.status')} {statusMap[order.status] || order.status}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${statusProgress[order.status]}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client_dashboard.filter_category')}</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="all">{t('category.all')}</option>
                {Object.keys(categoryMap).map(category => (
                  <option key={category} value={category}>{categoryMap[category]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client_dashboard.sort_by')}</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="name-asc">{t('sort.name_asc')}</option>
                <option value="name-desc">{t('sort.name_desc')}</option>
                <option value="price-asc">{t('sort.price_asc')}</option>
                <option value="price-desc">{t('sort.price_desc')}</option>
              </select>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 && !error && <p className="text-gray-600">{t('client_dashboard.no_products')}</p>}
            {filteredProducts.map(product => (
              <div key={product.id || Math.random()} className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200">
                <img src={product.imageUrl || '/placeholder.png'} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600">{product.description || t('client_dashboard.no_description')}</p>
                <p className="text-gray-700 font-semibold mt-2">${product.price.toFixed(2)}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-600 text-white p-2 rounded w-full mt-4 hover:bg-blue-700 transition-colors duration-200"
                  disabled={product.id === undefined}
                >
                  {t('client_dashboard.add_to_cart')}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/4">
          <Cart onCheckout={(cartItems) => handleCheckout(cartItems)} />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;