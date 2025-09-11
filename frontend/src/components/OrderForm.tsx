import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Product, CartItem, User } from '../types';

interface OrderFormProps {
  token: string;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const OrderForm: React.FC<OrderFormProps> = ({ token, cartItems, setCartItems }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, clientsResponse] = await Promise.all([
          axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users/clients', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProducts(productsResponse.data);
        setClients(clientsResponse.data);
        setError('');
      } catch (err: any) {
        setError(t('order_form.error_fetch_data') + ' ' + (err.response?.data || err.message));
      }
    };
    fetchData();
  }, [token, t]);

  const addToCart = (product: Product) => {
    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(item => item.productId === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({
        productId: product.id!,
        quantity: 1,
        price: product.price,
        name: product.name,
        description: product.description,
        category: product.category,
        isActive: product.isActive
      });
    }
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleSubmit = async () => {
    if (!selectedClientId || cartItems.length === 0) {
      setError(t('order_form.error_submit'));
      return;
    }
    try {
      const payload = {
        userId: parseInt(selectedClientId),
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        loyaltyPoints: 0,
        customPizza: cartItems.some(item => item.isCustomPizza)
      };
      await axios.post('/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
      setError('');
      navigate('/waiter');
    } catch (err: any) {
      setError(t('order_form.error_submit') + ' ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-4xl font-semibold text-gray-800 mb-6 animate-fade-in">{t('order_form.title')}</h2>
      {error && <p className="text-red-500 mb-6 font-medium bg-red-50 p-4 rounded-lg animate-fade-in">{error}</p>}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('order_form.select_client')}</label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <option value="">{t('order_form.select_client_placeholder')}</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
            <p className="text-gray-700 font-medium mb-4">
              {t('order_form.price')}: <span className="text-blue-600">${product.price.toFixed(2)}</span>
            </p>
            <button
              onClick={() => addToCart(product)}
              className="bg-blue-600 text-white p-3 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200"
            >
              {t('order_form.add_to_cart')}
            </button>
          </div>
        ))}
      </div>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('order_form.cart')}</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-600 text-lg">{t('order_form.cart_empty')}</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cartItems.map(item => (
              <li key={item.productId} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-medium">{item.name || `Product ID: ${item.productId}`}</p>
                  <p className="text-gray-600 text-sm">{t('order_form.quantity')}: {item.quantity}</p>
                  <p className="text-gray-600 text-sm">{t('order_form.unit_price')}: ${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  {t('order_form.remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={cartItems.length === 0 || !selectedClientId}
        className="bg-green-600 text-white p-3 rounded-lg w-full hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {t('order_form.submit')}
      </button>
    </div>
  );
};

export default OrderForm;