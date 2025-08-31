import React, { useState, useEffect, useContext } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useTranslation } from 'react-i18next';
import { CartContext, CartContextType } from '../CartContext';
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
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('accessToken') || '';

  if (!cartContext) {
    throw new Error('ClientDashboard must be used within a CartProvider');
  }
  const { cart, addToCart } = cartContext as CartContextType;

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
      console.log('Attempting to refresh token for email:', email, 'Role:', role);
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      console.log('Token refreshed successfully:', response.data.accessToken.substring(0, 10) + '...', 'Role:', response.data.role);
      return response.data.accessToken;
    } catch (err: any) {
      console.error('Token refresh failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      setError(t('error.token_refresh_failed'));
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
      if (!token) {
        setError(t('client_dashboard.no_products'));
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching products with token:', token.substring(0, 10) + '...', 'Role:', role);
      const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
      setProducts(response.data);
      console.log('Products fetched:', response.data.map(p => ({ name: p.name, category: p.category })));
      setError('');
    } catch (err: any) {
      console.error('Fetch products failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
          setProducts(response.data);
          console.log('Products fetched after refresh:', response.data.map(p => ({ name: p.name, category: p.category })));
          setError('');
        }
      } else {
        setError(t('client_dashboard.fetch_products_failed') + (err.response?.data || err.message));
      }
    }
  };

  const fetchOrders = async () => {
    try {
      if (!token || role !== 'ROLE_C') return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching orders with token:', token.substring(0, 10) + '...');
      const response: AxiosResponse<Order[]> = await axios.get('/api/orders/user', config);
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      console.error('Fetch orders failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Order[]> = await axios.get('/api/orders/user', config);
          setOrders(response.data);
          setError('');
        }
      } else {
        setError(t('client_dashboard.fetch_orders_failed') + (err.response?.data || err.message));
      }
    }
  };

  const setupWebSocket = () => {
    if (!token || role !== 'ROLE_C') {
      return () => {};
    }
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/orders'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        orders.forEach(order => {
          client.subscribe(`/topic/orders/${order.id}`, (message) => {
            const update: OrderStatusUpdate = JSON.parse(message.body);
            console.log('Received order update:', update);
            setOrders(prev => prev.map(o => o.id === update.orderId ? { ...o, status: update.status, modifiedAt: update.updatedAt } : o));
          });
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
        setError(t('client_dashboard.websocket_error'));
      }
    });
    client.activate();
    setStompClient(client);
    return () => {
      client.deactivate();
      console.log('WebSocket disconnected');
    };
  };

  const handleCheckout = async () => {
    try {
      if (!token) {
        setError(t('client_dashboard.no_products'));
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const orderItems = cart.map((item: CartItem) => ({
        productId: item.id!,
        quantity: item.quantity
      }));
      const payload = { items: orderItems };
      console.log('Submitting order with payload:', payload, 'Role:', role, 'Token:', token.substring(0, 10) + '...');
      const response = await axios.post('/api/orders', payload, config);
      console.log('Order created successfully:', response.data);
      cartContext.clearCart();
      setError('');
      fetchOrders();
    } catch (err: any) {
      console.error('Checkout failed:', err.response?.data || err.message, 'Status:', err.response?.status, 'Headers:', err.response?.headers);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const orderItems = cart.map((item: CartItem) => ({
            productId: item.id!,
            quantity: item.quantity
          }));
          const payload = { items: orderItems };
          console.log('Retrying order submission with new token:', newToken.substring(0, 10) + '...');
          const response = await axios.post('/api/orders', payload, config);
          console.log('Order created successfully after refresh:', response.data);
          cartContext.clearCart();
          setError('');
          fetchOrders();
        }
      } else {
        setError(t('client_dashboard.checkout_failed') + (err.response?.data || err.message));
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.id) {
      console.error('Cannot add product to cart: missing id', product);
      setError(t('client_dashboard.add_to_cart_failed'));
      return;
    }
    console.log('Adding to cart:', product);
    addToCart(product);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    console.log('Selected category:', selectedCategory);
    setCategoryFilter(selectedCategory);
  };

  useEffect(() => {
    console.log('Cart state:', cart);
    fetchProducts();
    if (role === 'ROLE_C') {
      fetchOrders();
      return setupWebSocket();
    }
  }, [navigate, role, token, orders.length]);

  const filteredProducts = products
    .filter(product => {
      const matches = categoryFilter === 'all' || product.category.trim().toUpperCase() === categoryFilter.trim().toUpperCase();
      console.log(`Filtering product: ${product.name}, category: ${product.category}, filter: ${categoryFilter}, matches: ${matches}`);
      return matches;
    })
    .sort((a, b) => {
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return 0;
    });

  const categories = Array.from(new Set(products.map(product => product.category.trim().toUpperCase()))).filter(category => category !== 'ALL');
  categories.unshift('all');

  return (
    <div className="container mx-auto p-6 flex flex-col lg:flex-row gap-6">
      {/* Product Menu */}
      <div className="lg:w-3/4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('client_dashboard.title')}</h2>
        {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
        {role === 'ROLE_C' && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">{t('client_dashboard.track_orders')}</h3>
            {orders.length === 0 && <p className="text-gray-600">{t('client_dashboard.no_orders')}</p>}
            {orders.map(order => (
              <div key={order.id} className="mb-4">
                <p className="text-gray-700 font-semibold">Order #{order.id}</p>
                <p className="text-gray-600">{t('client_dashboard.order_status', { status: statusMap[order.status] || order.status })}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${statusProgress[order.status] || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('client_dashboard.filter_category')}</label>
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="all">{t('category.all')}</option>
                {categories.map(category => (
                  category !== 'all' && (
                    <option key={category} value={category}>{categoryMap[category] || category}</option>
                  )
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
                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-gray-700 font-semibold mt-2">${product.price.toFixed(2)}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-600 text-white p-2 rounded w-full mt-4 hover:bg-blue-700 transition-colors duration-200"
                >
                  {t('client_dashboard.add_to_cart')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="lg:w-1/4">
        <Cart onCheckout={handleCheckout} />
      </div>
    </div>
  );
};

export default ClientDashboard;