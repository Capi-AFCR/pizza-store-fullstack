import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useTranslation } from 'react-i18next';
import { Product, CartItem, Order, OrderStatusHistory } from '../types';
import Cart from './Cart';

interface ClientDashboardProps {
  token: string;
  email: string;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  setError: (error: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ token, email, cartItems, setCartItems, setToken, setRole, setError }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name_asc');
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [localError, setLocalError] = useState<string>('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const role = localStorage.getItem('role') as string || '';

  const refreshAccessToken = async (): Promise<string> => {
    const storedEmail = localStorage.getItem('email');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedEmail || !storedRefreshToken) {
      const errorMsg = t('client_dashboard.error') + ' Missing email or refresh token';
      setError(errorMsg);
      setLocalError(errorMsg);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      setToken('');
      setRole('');
      navigate('/login');
      throw new Error(errorMsg);
    }

    try {
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email: storedEmail,
        refreshToken: storedRefreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      setToken(response.data.accessToken);
      setRole(response.data.role);
      return response.data.accessToken;
    } catch (err: any) {
      const errorMsg = t('client_dashboard.error') + ' ' + (err.response?.data || err.message);
      setError(errorMsg);
      setLocalError(errorMsg);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      setToken('');
      setRole('');
      navigate('/login');
      throw new Error(errorMsg);
    }
  };

  const fetchProducts = async (currentToken: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
      setProducts(response.data);
      setLocalError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        const config = { headers: { Authorization: `Bearer ${newToken}` } };
        const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
        setProducts(response.data);
        setLocalError('');
      } else {
        setLocalError(t('client_dashboard.error') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      }
    }
  };

  const fetchOrders = async (currentToken: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const response: AxiosResponse<Order[]> = await axios.get('/api/orders/client', config);
      setOrders(response.data);
      setLocalError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        const config = { headers: { Authorization: `Bearer ${newToken}` } };
        const response: AxiosResponse<Order[]> = await axios.get('/api/orders/client', config);
        setOrders(response.data);
        setLocalError('');
      } else {
        setLocalError(t('client_dashboard.error') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      }
    }
  };

  const fetchOrderDetails = async (orderId: number, currentToken: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const response: AxiosResponse<{ order: Order; statusHistory: OrderStatusHistory[] }> = await axios.get(`/api/orders/${orderId}/details`, config);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, ...response.data.order, statusHistory: response.data.statusHistory } : order
        )
      );
      setLocalError('');    
    } catch (err: any) {
      setLocalError(t('client_dashboard.error_details') + ' ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!token || !role) {
        setLocalError(t('client_dashboard.error_login'));
        navigate('/login');
        setIsLoading(false);
        return;
      }

      try {
        let currentToken = token;
        if (role === 'ROLE_C') {
          const [productsResponse, ordersResponse, pointsResponse] = await Promise.all([
            axios.get('/api/products', { headers: { Authorization: `Bearer ${currentToken}` } }).catch(async (err) => {
              if (err.response?.status === 401 || err.response?.status === 403) {
                currentToken = await refreshAccessToken();
                return axios.get('/api/products', { headers: { Authorization: `Bearer ${currentToken}` } });
              }
              throw err;
            }),
            axios.get('/api/orders/client', { headers: { Authorization: `Bearer ${currentToken}` } }).catch(async (err) => {
              if (err.response?.status === 401 || err.response?.status === 403) {
                currentToken = await refreshAccessToken();
                return axios.get('/api/orders/client', { headers: { Authorization: `Bearer ${currentToken}` } });
              }
              throw err;
            }),
            axios.get('/api/loyalty/points', { headers: { Authorization: `Bearer ${currentToken}` } }).catch(async (err) => {
              if (err.response?.status === 401 || err.response?.status === 403) {
                currentToken = await refreshAccessToken();
                return axios.get('/api/loyalty/points', { headers: { Authorization: `Bearer ${currentToken}` } });
              }
              throw err;
            })
          ]);
          setProducts(productsResponse.data);
          setOrders(ordersResponse.data);
          setLoyaltyPoints(pointsResponse.data);
          setLocalError('');
        } else {
          setLocalError(t('client_dashboard.error_role'));
          navigate('/login');
        }
      } catch (err: any) {
        setLocalError(t('client_dashboard.error') + ' ' + (err.response?.data || err.message));
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [token, role, navigate, setToken, setRole, setError]);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log('Attempting WebSocket connection with token:', token ? token.substring(0, 10) + '...' : 'No token');
      const socket = new SockJS('http://localhost:8080/ws/orders');
      const client = Stomp.over(socket);
      client.connect(
        { Authorization: `Bearer ${token}` },
        (frame: any) => {
          console.log('WebSocket connected:', frame);
          client.subscribe('/topic/orders', (message) => {
            console.log('Order update received:', JSON.parse(message.body));
            fetchOrders(token);
          });
          setStompClient(client);
        },
        (error: unknown) => {
          console.error('WebSocket connection error:', error);
          setLocalError(t('client_dashboard.websocket_error'));
          setTimeout(connectWebSocket, 5000);
        }
      );
    };

    if (token && role === 'ROLE_C') {
      connectWebSocket();
    }

    return () => {
      if (stompClient?.connected) {
        stompClient.deactivate().then(() => {
          console.log('WebSocket disconnected');
        }).catch((err) => {
          console.error('WebSocket disconnection error:', err);
        });
      }
    };
  }, [t, token, role]);

  const handleCheckout = async (cartItems: CartItem[], loyaltyPoints: number, scheduledAt?: string) => {
    try {
      if (!token) {
        setLocalError('Please log in to place an order.');
        navigate('/login');
        return;
      }
      let currentToken = token;
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const userResponse = await axios.get(`/api/users/email/${email}`, config).catch(async (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          currentToken = await refreshAccessToken();
          return axios.get(`/api/users/email/${email}`, { headers: { Authorization: `Bearer ${currentToken}` } });
        }
        throw err;
      });
      const userId = userResponse.data.id;
      const orderItems = cartItems.map((item: CartItem) => ({
        productId: item.id!,
        ingredients: item.ingredients?.map(ingredient => ingredient?.id)|| null,
        quantity: item.quantity,
        price: item.price,
        isCustomPizza: item.isCustomPizza
      }));
      const payload = { userId, items: orderItems, loyaltyPoints, scheduledAt };
      console.log('Submitting order with payload:', payload, 'Role:', role, 'Token:', currentToken.substring(0, 10) + '...');
      const response = await axios.post('/api/orders', payload, { headers: { Authorization: `Bearer ${currentToken}` } });
      console.log('Order created successfully:', response.data);
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
      setLocalError('');
      navigate('/orders/client');
    } catch (err: any) {
      console.error('Checkout failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      setLocalError(t('client_dashboard.error_checkout') + ' ' + (err.response?.data || err.message));
    }
  };

  const addToCart = (item: CartItem) => {
    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(cartItem => {
      if (item.isCustomPizza && cartItem.isCustomPizza) {
        return JSON.stringify(cartItem.ingredients?.map(i => i.id).sort()) === JSON.stringify(item.ingredients?.map(i => i.id).sort());
      }
      return cartItem.productId === item.productId;
    });
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      if (item.isCustomPizza) {
        updatedCart.push({ ...item, id: Date.now() });
      } else {
        updatedCart.push({ ...item, id: item.productId});
      }
    }
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderDetails(orderId, token);
    }
  };

  const filteredProducts = products
    .filter(product => product.id !== undefined && (category === 'all' || product.category === category))
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  if (isLoading) {
    return <div className="container mx-auto px-6 py-8 text-center text-gray-600">{t('client_dashboard.loading')}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold text-gray-800 animate-fade-in">{t('client_dashboard.title')}</h2>
          <button
            onClick={() => navigate('/custom-pizza')}
            className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {t('client_dashboard.build_pizza')}
          </button>
        </div>       
        {localError && <p className="text-red-500 mb-6 font-medium bg-red-50 p-4 rounded-lg animate-fade-in">{localError}</p>}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md animate-fade-in">
          <p className="text-xl font-medium text-gray-700">
            {t('client_dashboard.loyalty_points')}: <span className="text-blue-600">{loyaltyPoints}</span>
          </p>
        </div>
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('client_dashboard.filter_category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="all">{t('client_dashboard.category_all')}</option>
              <option value="AP">{t('client_dashboard.category_ap')}</option>
              <option value="MC">{t('client_dashboard.category_mc')}</option>
              <option value="SD">{t('client_dashboard.category_sd')}</option>
              <option value="DR">{t('client_dashboard.category_dr')}</option>
              <option value="DE">{t('client_dashboard.category_de')}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('client_dashboard.sort_by')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="name_asc">{t('client_dashboard.sort_name_asc')}</option>
              <option value="name_desc">{t('client_dashboard.sort_name_desc')}</option>
              <option value="price_asc">{t('client_dashboard.sort_price_asc')}</option>
              <option value="price_desc">{t('client_dashboard.sort_price_desc')}</option>
            </select>
          </div>
        </div>
        {products.length === 0 && (
          <p className="text-gray-600 text-lg animate-fade-in">{t('client_dashboard.no_products')}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              <p className="text-gray-700 font-medium mb-4">
                {t('client_dashboard.price')}: <span className="text-blue-600">${product.price.toFixed(2)}</span>
              </p>
              <button
                onClick={() => addToCart({ productId: product.id!, quantity: 1, price: product.price, name: product.name, description: product.description, category: product.category, isActive: product.isActive })}
                className="bg-blue-600 text-white p-3 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200"
              >
                {t('client_dashboard.add_to_cart')}
              </button>
            </div>
          ))}
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 animate-fade-in">{t('client_dashboard.track_orders')}</h3>
          {orders.length === 0 ? (
            <p className="text-gray-600 text-lg animate-fade-in">{t('client_dashboard.no_orders')}</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {orders.map(order => (
                <li key={order.id} className="py-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 font-medium">
                        {t('client_dashboard.order_id')}: <span className="text-blue-600">{order.id}</span>
                      </p>
                      <p className="text-gray-600">
                        {t('client_dashboard.order_status')}: <span className="text-blue-600">{t(`client_dashboard.status_${order.status.toLowerCase()}`)}</span>
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
                    <button
                      onClick={() => toggleOrderDetails(order.id!)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      {expandedOrder === order.id ? t('client_dashboard.hide_details') : t('client_dashboard.show_details')}
                    </button>
                  </div>
                  {expandedOrder === order.id && order.statusHistory && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('client_dashboard.order_items')}</h4>
                      <ul className="list-disc pl-5 mb-4">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-gray-600">
                            {order.customPizza && item.productId === 0 ? 'Custom Pizza' : `Product ID ${item.productId}`}: {item.quantity} x ${item.price.toFixed(2)}
                            {order.customPizza && item.productId === 0 && (
                              <ul className="list-circle pl-5">
                                {cartItems.find(cartItem => cartItem.productId === 0 && cartItem.isCustomPizza)?.ingredients?.map(ingredient => (
                                  <li key={ingredient.id}>{ingredient.name} (${ingredient.price.toFixed(2)})</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('client_dashboard.status_history')}</h4>
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
      </div>
      {/* Fixed Cart */}
      <div
        className={`fixed top-16 right-0 w-80 bg-white shadow-xl rounded-l-lg transform transition-transform duration-300 z-40 lg:block ${
          isCartOpen ? 'translate-x-0' : 'translate-x-80'
        } hidden`}
      >
        <button
          className="absolute top-4 -left-12 bg-blue-600 text-white p-2 rounded-l-lg hover:bg-blue-700 transition-colors duration-200"
          onClick={() => setIsCartOpen(!isCartOpen)}
          aria-label={isCartOpen ? t('cart.close') : t('cart.open')}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/263/263142.png"
            alt={isCartOpen ? t('cart.close') : t('cart.open')}
            className="w-6 h-6"
          />
        </button>
        <div className="p-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <Cart
            onCheckout={handleCheckout}
            token={token}
            cartItems={cartItems}
            setCartItems={setCartItems}
          />
        </div>
      </div>
      {/* Mobile Cart Toggle */}
      <button
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        onClick={() => navigate('/cart')}
        aria-label={t('cart.open')}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/263/263142.png"
          alt={t('cart.open')}
          className="w-6 h-6"
        />
      </button>
    </div>
  );
};

export default ClientDashboard;