import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../types';

interface CartProps {
  onCheckout: (items: CartItem[]) => void;
  disabled?: boolean;
}

const Cart: React.FC<CartProps> = ({ onCheckout, disabled = false }) => {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'));

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
      onCheckout(cartItems);
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('cart.title')}</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">{t('cart.empty')}</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {cartItems.map(item => (
              <li key={item.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-semibold">{t('cart.product_id')}: {item.id}</p>
                  <p className="text-gray-600">{t('cart.quantity')}: {item.quantity}</p>
                  <p className="text-gray-600">{t('cart.unit_price')}: ${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id!)} // Use non-null assertion as cart items should have valid IDs
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  {t('cart.remove')}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-gray-700 font-semibold">{t('cart.total')}: ${totalPrice.toFixed(2)}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCheckout}
                className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={disabled || cartItems.length === 0}
              >
                {t('cart.checkout')}
              </button>
              <button
                onClick={handleClearCart}
                className="bg-gray-500 text-white p-2 rounded w-full hover:bg-gray-600 transition-colors duration-200"
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