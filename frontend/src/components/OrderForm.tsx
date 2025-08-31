import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Product, CartItem } from '../types';
import Cart from './Cart';
import { useCart } from '../contexts/CartContext';

const OrderForm: React.FC = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string>('');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  const token = localStorage.getItem('accessToken') || '';

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
      setError(t('order_form.error_token'));
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      navigate('/login');
      return null;
    }
  };

  const fetchClients = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<User[]> = await axios.get('/api/users/clients', config);
      setClients(response.data);
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<User[]> = await axios.get('/api/users/clients', config);
          setClients(response.data);
        }
      } else {
        setError(t('order_form.error_fetch') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
      setProducts(response.data);
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
          setProducts(response.data);
        }
      } else {
        setError(t('order_form.error_fetch') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  useEffect(() => {
    if (role === 'ROLE_A' || role === 'ROLE_W') {
      fetchClients();
      fetchProducts();
    } else {
      navigate('/login');
    }
  }, [role, token, navigate]);

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

  const handleSubmit = async (cartItems : CartItem[]) => {
    if (!selectedClient) {
      setError(t('order_form.error_client'));
      return;
    }
    if (cartItems.length === 0) {
      setError(t('cart.empty'));
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const order = {
        userId: selectedClient,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: cartItems.reduce((total, item) => total + item.quantity * item.price, 0),
        status: 'PE',
        createdBy: localStorage.getItem('email') || 'system',
        modifiedBy: localStorage.getItem('email') || 'system'
      };
      await axios.post('/api/orders', order, config);
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
      setError('');
      navigate('/orders');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const order = {
            userId: selectedClient,
            items: cartItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            })),
            totalPrice: cartItems.reduce((total, item) => total + item.quantity * item.price, 0),
            status: 'PE',
            createdBy: localStorage.getItem('email') || 'system',
            modifiedBy: localStorage.getItem('email') || 'system'
          };
          await axios.post('/api/orders', order, config);
          setCartItems([]);
          localStorage.setItem('cart', JSON.stringify([]));
          setError('');
          navigate('/orders');
        }
      } else {
        setError(t('order_form.error_save') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('order_form.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {(role !== 'ROLE_A' && role !== 'ROLE_W') && (
        <p className="text-red-500 mb-4 font-semibold">{t('order_form.error_access')}</p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('order_form.select_client')}</label>
          <select
            value={selectedClient || ''}
            onChange={(e) => setSelectedClient(Number(e.target.value) || null)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('order_form.select_client')}</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          {clients.length === 0 && <p className="text-gray-600 mt-2">{t('order_form.no_clients')}</p>}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('order_form.products')}</h3>
          {products.length === 0 ? (
            <p className="text-gray-600">{t('order_form.no_products')}</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {products.map(product => (
                <li key={product.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="text-gray-700 font-semibold">{product.name}</p>
                    <p className="text-gray-600">{t('order_form.price')}: ${product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    {t('order_form.add_to_cart')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-6">
        <Cart
          onCheckout={(cartItems) => handleSubmit(cartItems)}
          disabled={(role === 'ROLE_W' || role === 'ROLE_A') && !selectedClient}
        />
      </div>
    </div>
  );
};

export default OrderForm;