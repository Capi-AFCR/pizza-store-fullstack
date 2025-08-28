import React, { useContext } from 'react';
import { CartContext, CartContextType } from '../CartContext';
import { CartItem } from '../types';

interface CartProps {
  onCheckout: () => void;
  disabled?: boolean;
}

const Cart: React.FC<CartProps> = ({ onCheckout, disabled }) => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    throw new Error('Cart must be used within a CartProvider');
  }
  const { cart, removeFromCart, clearCart } = cartContext as CartContextType;

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Cart</h3>
      {cart.length === 0 && <p className="text-gray-600">Your cart is empty.</p>}
      <div className="grid gap-4">
        {cart.map(item => (
          <div key={item.id || Math.random()} className="flex justify-between items-center border-b py-2">
            <div>
              <p className="text-gray-700 font-semibold">{item.name}</p>
              <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
            </div>
            <button
              onClick={() => item.id && removeFromCart(item.id)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
              disabled={!item.id}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-700 font-semibold">Total: ${totalPrice.toFixed(2)}</p>
          <button
            onClick={clearCart}
            className="bg-gray-500 text-white p-2 rounded w-full mt-2 hover:bg-gray-600 transition-colors duration-200"
          >
            Clear Cart
          </button>
          <button
            onClick={onCheckout}
            disabled={disabled || cart.length === 0}
            className="bg-blue-600 text-white p-2 rounded w-full mt-2 hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;