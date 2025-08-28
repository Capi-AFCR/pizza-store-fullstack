import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [availableFilter, setAvailableFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const refreshAccessToken = async () => {
    try {
      const email = localStorage.getItem('email') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      console.log('Attempting token refresh for:', email);
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      console.log('Token refresh successful:', response.data);
      return response.data.accessToken;
    } catch (err: any) {
      const errorMessage = 'Failed to refresh token. Please log in again.';
      console.error(errorMessage, err);
      setError(errorMessage);
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
      let token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to view the menu.');
        navigate('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching products with config:', config);
      const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
      console.log('Products fetched:', response.data);
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
          setProducts(response.data);
          setError('');
        } else {
          setError('Authentication failed. Please log in again.');
        }
      } else {
        const errorMessage = 'Failed to fetch products: ' + (err.response?.data || err.message);
        console.error(errorMessage);
        setError(errorMessage);
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({ productId: product.id, quantity: 1, price: product.price, name: product.name });
  };

  const handleProceedToOrder = () => {
    navigate('/orders/new', { state: { cartItems } });
  };

  const filterAndSortProducts = (products: Product[]) => {
    let filtered = [...products];
    
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    if (availableFilter !== null) {
      filtered = filtered.filter(product => product.available === availableFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return filtered;
  };

  const groupByCategory = (products: Product[]) => {
    return products.reduce((acc: { [key: string]: Product[] }, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  };

  const categoryNames: { [key: string]: string } = {
    AP: 'Appetizers',
    MC: 'Main Courses',
    SD: 'Side Dishes',
    DR: 'Drinks',
    DE: 'Desserts'
  };

  const filteredProducts = filterAndSortProducts(products);
  const groupedProducts = categoryFilter === 'ALL' ? groupByCategory(filteredProducts) : { [categoryFilter]: filteredProducts };

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white rounded-lg p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome to Pizza Store</h1>
        <p className="text-lg">Order your favorite pizzas and sides today!</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Menu Section */}
        <div className="lg:w-2/3">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Menu</h2>
          {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border p-2 rounded w-full sm:w-48 focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="ALL">All Categories</option>
                <option value="AP">Appetizers</option>
                <option value="MC">Main Courses</option>
                <option value="SD">Side Dishes</option>
                <option value="DR">Drinks</option>
                <option value="DE">Desserts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={availableFilter === null ? 'ALL' : availableFilter.toString()}
                onChange={(e) => setAvailableFilter(e.target.value === 'ALL' ? null : e.target.value === 'true')}
                className="border p-2 rounded w-full sm:w-48 focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="ALL">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border p-2 rounded w-full sm:w-48 focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
          {Object.keys(groupedProducts).length === 0 && !error && <p className="text-gray-600">No products available.</p>}
          {Object.entries(groupedProducts).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">{categoryNames[category] || category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(product => (
                  <div
                    key={product.id}
                    className={`border rounded-lg shadow-md p-4 bg-white hover:shadow-xl transition-shadow duration-300 ${product.available ? '' : 'opacity-50'}`}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md mb-4 transform hover:scale-105 transition-transform duration-200"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Not+Found')}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-800">{product.name}</h4>
                    <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-green-600 font-semibold mb-2">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mb-2">Available: {product.available ? 'Yes' : 'No'}</p>
                    {product.available && (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Cart Section */}
        <div className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-md sticky top-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Cart</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.productId} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">Unit Price: ${item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2">
                        <label className="text-sm text-gray-700 mr-2">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                          className="border p-1 w-16 rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-600 font-semibold transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <p className="text-gray-800 font-semibold">Total Items: {totalItems}</p>
                <p className="text-gray-800 font-semibold">Total Price: ${totalPrice.toFixed(2)}</p>
                <button
                  onClick={handleProceedToOrder}
                  className="w-full bg-green-600 text-white p-2 rounded mt-4 hover:bg-green-700 transition-colors duration-200"
                >
                  Proceed to Order
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-600 text-white p-2 rounded mt-2 hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;