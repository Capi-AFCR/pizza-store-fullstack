import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleProceedToOrder = () => {
    navigate('/orders/new', { state: { cartItems } });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.productId} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{item.name}</p>
                <p>Unit Price: ${item.price.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  <label className="mr-2">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    className="border p-1 w-16 rounded"
                  />
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="mt-4">
            <p><strong>Total Items:</strong> {totalItems}</p>
            <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
            <button
              onClick={handleProceedToOrder}
              className="bg-green-500 text-white p-2 rounded w-full mt-2"
            >
              Proceed to Order
            </button>
            <button
              onClick={clearCart}
              className="bg-gray-500 text-white p-2 rounded w-full mt-2"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;