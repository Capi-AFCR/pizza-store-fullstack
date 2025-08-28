import React, { useContext } from 'react';
import { CartContext, CartContextType } from '../CartContext';
import { CartItem } from '../types';

interface CartProps {
  onCheckout: () => void;
  disabled?: boolean;
}

const Cart: React.FC<CartProps> = ({ onCheckout, disabled = false }) => {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error('Cart must be used within a CartProvider');
  }
  const { cart, removeFromCart, clearCart } = cartContext as CartContextType;

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Cart</h3>
      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item: CartItem) => (
              <li key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700">{item.name} (x{item.quantity})</p>
                  <p className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors duration-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4">
            <button
              onClick={clearCart}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Clear Cart
            </button>
            <button
              onClick={onCheckout}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;