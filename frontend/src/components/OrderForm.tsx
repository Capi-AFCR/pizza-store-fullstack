import React, { useState, useEffect, useContext } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { CartContext, CartContextType } from '../CartContext';
import { Product, User, CartItem } from '../types';
import Cart from './Cart';

const OrderForm: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [error, setError] = useState<string>('');
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('accessToken') || '';

  if (!cartContext) {
    throw new Error('OrderForm must be used within a CartProvider');
  }
  const { cart } = cartContext as CartContextType;

  const refreshAccessToken = async () => {
    try {
      const email = localStorage.getItem('email') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      console.log('Attempting to refresh token for email:', email);
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      console.log('Token refreshed successfully:', response.data.accessToken.substring(0, 10) + '...');
      return response.data.accessToken;
    } catch (err: any) {
      console.error('Token refresh failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      setError('Failed to refresh token. Please log in again.');
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
        setError('Please log in to view products.');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching products with token:', token.substring(0, 10) + '...');
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
        setError('Failed to fetch products: ' + (err.response?.data || err.message));
      }
    }
  };

  const fetchClients = async () => {
    if (role !== 'ROLE_W' && role !== 'ROLE_A') return;
    try {
      if (!token) {
        setError('Please log in to fetch clients.');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching clients with token:', token.substring(0, 10) + '...');
      const response: AxiosResponse<User[]> = await axios.get('/api/users/clients', config);
      setClients(response.data);
      setError('');
    } catch (err: any) {
      console.error('Fetch clients failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<User[]> = await axios.get('/api/users/clients', config);
          setClients(response.data);
          setError('');
        }
      } else {
        setError('Failed to fetch clients: ' + (err.response?.data || err.message));
      }
    }
  };

  useEffect(() => {
    console.log('Cart state:', cart);
    fetchProducts();
    fetchClients();
  }, [role, navigate, token]);

  const handleSubmit = async () => {
    if ((role === 'ROLE_W' || role === 'ROLE_A') && !selectedClient) {
      setError('Please select a client.');
      return;
    }
    try {
      if (!token) {
        setError('Please log in to place an order.');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const orderItems = cart.map((item: CartItem) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      const payload = (role === 'ROLE_W' || role === 'ROLE_A') ? { userId: parseInt(selectedClient), items: orderItems } : { items: orderItems };
      console.log('Submitting order with payload:', payload, 'Role:', role, 'Token:', token.substring(0, 10) + '...');
      await axios.post('/api/orders', payload, config);
      cartContext.clearCart();
      setSelectedClient('');
      setError('');
      navigate(role === 'ROLE_W' || role === 'ROLE_A' ? (role === 'ROLE_W' ? '/waiter' : '/admin') : '/');
    } catch (err: any) {
      console.error('Order submission failed:', err.response?.data || err.message, 'Status:', err.response?.status, 'Headers:', err.response?.headers);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const orderItems = cart.map((item: CartItem) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }));
          const payload = (role === 'ROLE_W' || role === 'ROLE_A') ? { userId: parseInt(selectedClient), items: orderItems } : { items: orderItems };
          console.log('Retrying order submission with new token:', newToken.substring(0, 10) + '...');
          await axios.post('/api/orders', payload, config);
          cartContext.clearCart();
          setSelectedClient('');
          setError('');
          navigate(role === 'ROLE_W' || role === 'ROLE_A' ? (role === 'ROLE_W' ? '/waiter' : '/admin') : '/');
        }
      } else {
        setError('Failed to place order: ' + (err.response?.data || err.message));
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Order</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {(role === 'ROLE_W' || role === 'ROLE_A') && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {products.length === 0 && !error && <p className="text-gray-600">No products found. Please log in.</p>}
        {products.map(product => (
          <div key={product.id} className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-gray-700 font-semibold mt-2">${product.price.toFixed(2)}</p>
            <button
              onClick={() => cartContext.addToCart(product)}
              className="bg-blue-600 text-white p-2 rounded w-full mt-4 hover:bg-blue-700 transition-colors duration-200"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <Cart
        onCheckout={handleSubmit}
        disabled={(role === 'ROLE_W' || role === 'ROLE_A') && !selectedClient}
      />
    </div>
  );
};

export default OrderForm;