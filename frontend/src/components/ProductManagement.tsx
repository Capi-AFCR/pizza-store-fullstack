import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';

const ProductManagement: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  const refreshAccessToken = async () => {
    try {
      const email = localStorage.getItem('email') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      console.log('Attempting to refresh token for email:', email);
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      console.log('Token refreshed successfully:', response.data.accessToken.substring(0, 10) + '...');
      return response.data.accessToken;
    } catch (err: any) {
      console.error('Token refresh failed:', err.response?.data || err.message);
      setError(t('product_management.error_token'));
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching products with token:', token.substring(0, 10) + '...');
      const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      console.error('Fetch products failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<Product[]> = await axios.get('/api/products', config);
          setProducts(response.data);
          setError('');
        }
      } else {
        setError(t('product_management.error_fetch') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.price || !['AP', 'MC', 'SD', 'DR', 'DE'].includes(formData.category)) {
      setError(t('product_management.error_form'));
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...formData, id: undefined };
      let response: AxiosResponse<Product>;
      if (editingId) {
        console.log('Updating product:', formData);
        response = await axios.put(`/api/products/${editingId}`, formData, config);
      } else {
        console.log('Creating product:', payload);
        response = await axios.post('/api/products', payload, config);
      }
      setProducts(prev => editingId ? prev.map(p => p.id === editingId ? response.data : p) : [...prev, response.data]);
      resetForm();
      setError('');
    } catch (err: any) {
      console.error('Product operation failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const payload = { ...formData, id: undefined };
          let response: AxiosResponse<Product>;
          if (editingId) {
            response = await axios.put(`/api/products/${editingId}`, formData, config);
          } else {
            response = await axios.post('/api/products', payload, config);
          }
          setProducts(prev => editingId ? prev.map(p => p.id === editingId ? response.data : p) : [...prev, response.data]);
          resetForm();
          setError('');
        }
      } else {
        setError(t('product_management.error_save') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Deleting product ID:', id);
      await axios.delete(`/api/products/${id}`, config);
      setProducts(prev => prev.filter(p => p.id !== id));
      setError('');
    } catch (err: any) {
      console.error('Delete product failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          await axios.delete(`/api/products/${id}`, config);
          setProducts(prev => prev.filter(p => p.id !== id));
          setError('');
        }
      } else {
        setError(t('product_management.error_delete') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const handleEdit = (product: Product) => {
    if (!product.id) {
      setError(t('product_management.error_edit'));
      return;
    }
    setFormData(product);
    setEditingId(product.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      isActive: true
    });
    setEditingId(null);
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('product_management.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

      {/* Product Form */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">{editingId ? t('product_management.edit_product', 'Edit Product') : t('product_management.add_product', 'Add New Product')}</h3>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder={t('product_management.name_placeholder', 'Name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder={t('product_management.description_placeholder', 'Description')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder={t('product_management.price_placeholder', 'Price')}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder={t('product_management.image_placeholder', 'Image URL')}
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as 'AP' | 'MC' | 'SD' | 'DR' | 'DE' | '' })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('product_management.select_category', 'Select Category')}</option>
            <option value="AP">{t('client_dashboard.category_ap', 'Appetizers')}</option>
            <option value="MC">{t('client_dashboard.category_mc', 'Main Courses')}</option>
            <option value="SD">{t('client_dashboard.category_sd', 'Sides')}</option>
            <option value="DR">{t('client_dashboard.category_dr', 'Drinks')}</option>
            <option value="DE">{t('client_dashboard.category_de', 'Desserts')}</option>
          </select>
          <div className="flex gap-4">
            <button
              onClick={handleCreateOrUpdate}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors duration-200"
            >
              {editingId ? t('product_management.update', 'Update') : t('product_management.create', 'Create')}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors duration-200"
              >
                {t('product_management.cancel', 'Cancel')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">{t('product_management.product_list', 'Product List')}</h3>
        {products.length === 0 && !error && <p className="text-gray-600">{t('product_management.no_products', 'No products found.')}</p>}
        <div className="grid gap-4">
          {products.map(product => (
            <div key={product.id || Math.random()} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="text-gray-700 font-semibold">{product.name}</p>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-gray-700">${product.price.toFixed(2)}</p>
                <p className="text-gray-600">{t('product_management.category', 'Category')}: {product.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                >
                  {t('product_management.edit', 'Edit')}
                </button>
                {product.id && (
                  <button
                    onClick={() => product.id && handleDelete(product.id)} // Ensure id is defined
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
                  >
                    {t('product_management.delete', 'Delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;