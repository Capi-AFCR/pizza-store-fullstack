import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { CartItem } from '../types';

interface CartProps {
  onCheckout: (items: CartItem[], loyaltyPoints: number, scheduledAt?: string) => void;
  disabled?: boolean;
  token: string;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Cart: React.FC<CartProps> = ({ onCheckout, disabled = false, token, cartItems, setCartItems }) => {
  const { t } = useTranslation();
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await axios.get('/api/loyalty/points', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoyaltyPoints(response.data);
      } catch (err: any) {
        setError(t('cart.error_fetch_points') + ' ' + (err.response?.data || err.message));
      }
    };
    if (token) fetchPoints();
  }, [token, t]);

  const handleRemove = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      onCheckout(cartItems, pointsToRedeem, scheduledAt || undefined);
      setPointsToRedeem(0);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
  const maxPoints = Math.min(loyaltyPoints, Math.floor(totalPrice / 5) * 10); // 10 points = $5 discount

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('cart.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-medium bg-red-50 p-3 rounded-lg">{error}</p>}
      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-lg">{t('cart.empty')}</p>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <p className="text-lg font-medium text-gray-700">
              {t('cart.loyalty_points')}: <span className="text-blue-600">{loyaltyPoints}</span>
            </p>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.redeem_points')}</label>
              <input
                type="number"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(Math.min(Number(e.target.value), maxPoints))}
                min="0"
                max={maxPoints}
                step="10"
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
              <p className="text-sm text-gray-600 mt-1">
                {t('cart.redeem_info', { points: 10, discount: 5 })}
              </p>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart.schedule_order')}</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} // 1 hour from now
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
              <p className="text-sm text-gray-600 mt-1">{t('cart.schedule_info')}</p>
            </div>
          </div>
          <ul className="divide-y divide-gray-200 flex-1">
            {cartItems.map(item => (
              <li key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-medium">{item.name || `Product ID: ${item.id}`}</p>
                  {item.isCustomPizza && (
                    <p className="text-gray-600 text-sm">{t('custom_pizza.custom_pizza')}</p>
                  )}
                  <p className="text-gray-600 text-sm">{t('cart.quantity')}: {item.quantity}</p>
                  <p className="text-gray-600 text-sm">{t('cart.unit_price')}: ${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id!)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  {t('cart.remove')}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="text-gray-700 font-medium">
              {t('cart.total')}: <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
            </p>
            <div className="flex flex-col gap-3 mt-3">
              <button
                onClick={handleCheckout}
                className="bg-blue-600 text-white p-3 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={disabled || cartItems.length === 0}
              >
                {t('cart.checkout')}
              </button>
              <button
                onClick={handleClearCart}
                className="bg-gray-500 text-white p-3 rounded-lg w-full hover:bg-gray-600 transition-colors duration-200"
              >
                {t('cart.clear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;