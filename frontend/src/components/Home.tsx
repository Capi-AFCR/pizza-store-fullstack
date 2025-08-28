import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [availableFilter, setAvailableFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const navigate = useNavigate();

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

  const handleAddToOrder = (productId: number) => {
    navigate('/orders/new', { state: { productId } });
  };

  const filterAndSortProducts = (products: Product[]) => {
    let filtered = [...products];
    
    // Filter by category
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Filter by availability
    if (availableFilter !== null) {
      filtered = filtered.filter(product => product.available === availableFilter);
    }

    // Sort
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Pizza Store Menu</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border p-2 rounded w-full sm:w-48"
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
          <label className="block text-sm font-medium mb-1">Filter by Availability</label>
          <select
            value={availableFilter === null ? 'ALL' : availableFilter.toString()}
            onChange={(e) => setAvailableFilter(e.target.value === 'ALL' ? null : e.target.value === 'true')}
            className="border p-2 rounded w-full sm:w-48"
          >
            <option value="ALL">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded w-full sm:w-48"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>
      {Object.keys(groupedProducts).length === 0 && !error && <p>No products available.</p>}
      {Object.entries(groupedProducts).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{categoryNames[category] || category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(product => (
              <div key={product.id} className={`border p-4 rounded ${product.available ? '' : 'opacity-50'}`}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-4"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Not+Found')}
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded mb-4 flex items-center justify-center">
                    <span>No Image</span>
                  </div>
                )}
                <h4 className="text-lg font-bold">{product.name}</h4>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-green-600 font-semibold">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Available: {product.available ? 'Yes' : 'No'}</p>
                {product.available && (
                  <button
                    onClick={() => handleAddToOrder(product.id)}
                    className="mt-2 bg-blue-500 text-white p-2 rounded w-full"
                  >
                    Add to Order
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;