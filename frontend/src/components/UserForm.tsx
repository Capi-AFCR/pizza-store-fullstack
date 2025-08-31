import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

const UserForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: '',
    role: 'C',
    active: true,
    createdBy: 'system',
    modifiedBy: 'system'
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem('accessToken') || '';

  const refreshAccessToken = async () => {
    try {
      const email = localStorage.getItem('email') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      return response.data.accessToken;
    } catch (err: any) {
      console.error('Token refresh failed:', err.response?.data || err.message);
      setError(t('user_form.error_token'));
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      navigate('/login');
      return null;
    }
  };

  const fetchUser = async () => {
    if (!id) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<User> = await axios.get(`/api/users/${id}`, config);
      setFormData(response.data);
      setError('');
    } catch (err: any) {
      console.error('Fetch user failed:', err.response?.data || err.message);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<User> = await axios.get(`/api/users/${id}`, config);
          setFormData(response.data);
          setError('');
        }
      } else {
        setError(t('user_form.error_fetch') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError(t('user_form.error_form'));
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response: AxiosResponse<User>;
      if (id) {
        console.log('Updating user:', formData);
        response = await axios.put(`/api/users/${id}`, formData, config);
      } else {
        console.log('Creating user:', formData);
        response = await axios.post('/api/users', formData, config);
      }
      navigate('/admin/users');
      setError('');
    } catch (err: any) {
      console.error('User operation failed:', err.response?.data || err.message);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          let response: AxiosResponse<User>;
          if (id) {
            response = await axios.put(`/api/users/${id}`, formData, config);
          } else {
            response = await axios.post('/api/users', formData, config);
          }
          navigate('/admin/users');
          setError('');
        }
      } else {
        setError(t('user_form.error_save') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id, token]);

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('user_form.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('user_form.name')}</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('user_form.email')}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('user_form.password')}</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('user_form.role')}</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'A' | 'C' | 'K' | 'D' | 'W' })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="A">{t('user_form.role_admin')}</option>
            <option value="C">{t('user_form.role_client')}</option>
            <option value="K">{t('user_form.role_kitchen')}</option>
            <option value="D">{t('user_form.role_delivery')}</option>
            <option value="W">{t('user_form.role_waiter')}</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('user_form.active')}</label>
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
        >
          {id ? t('user_form.update') : t('user_form.create')}
        </button>
      </form>
    </div>
  );
};

export default UserForm;