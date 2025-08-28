import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Product, OrderItem, User } from '../types';
import { useCart } from '../CartContext';

const OrderForm: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const initialProductId = location.state?.productId;
  const initialCartItems = location.state?.cartItems;
  const role = localStorage.getItem('role') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Please log in to place an order.');
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch products
        const productResponse: AxiosResponse<Product[]> = await axios.get('/api/products', config);
        setProducts(productResponse.data);

        // Fetch users for Admin/Waiter
        if (role === 'ROLE_A' || role === 'ROLE_W') {
          const userResponse: AxiosResponse<User[]> = await axios.get('/api/users', config);
          setUsers(userResponse.data);
        }

        // Initialize order items
        if (initialCartItems) {
          setOrderItems(initialCartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          })));
        } else if (initialProductId) {
          const product = productResponse.data.find(p => p.id === initialProductId);
          if (product) {
            setOrderItems([{ productId: initialProductId, quantity: 1, price: product.price }]);
          }
        }
      } catch (err: any) {
        setError('Failed to fetch data: ' + (err.response?.data || err.message));
      }
    };
    fetchData();
  }, [initialProductId, initialCartItems, navigate, role]);

  const handleAddItem = () => {
    const product = products[0];
    if (product) {
      setOrderItems([...orderItems, { productId: product.id, quantity: 1, price: product.price }]);
    }
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: number) => {
    const updatedItems = [...orderItems];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index] = { ...updatedItems[index], productId: value, price: product.price };
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], quantity: value };
    }
    setOrderItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to place an order.');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/orders', { userId: selectedUserId, items: orderItems }, config);
      clearCart();
      setError('');
      navigate('/orders');
    } catch (err: any) {
      setError('Failed to create order: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Create Order</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {(role === 'ROLE_A' || role === 'ROLE_W') && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Select Client</label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
            className="border p-2 w-full rounded"
          >
            <option value="">Select a client</option>
            {users.filter(u => u.role === 'C').map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {orderItems.map((item, index) => (
          <div key={index} className="border p-4 rounded space-y-2">
            <div>
              <label className="block text-sm font-medium">Product</label>
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                className="border p-2 w-full rounded"
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name} (${product.price.toFixed(2)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                className="border p-2 w-full rounded"
              />
            </div>
            <p className="text-sm text-gray-500">Unit Price: ${item.price.toFixed(2)}</p>
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={products.length === 0}
        >
          Add Item
        </button>
        <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default OrderForm;