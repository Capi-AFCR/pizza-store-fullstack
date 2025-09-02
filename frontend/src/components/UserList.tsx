import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
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
      return response.data.accessToken;
    } catch (err: any) {
      console.error('Token refresh failed:', err.response?.data || err.message);
      setError(t('user_list.error_token'));
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      navigate('/login');
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Fetching users with token:', token.substring(0, 10) + '...');
      const response: AxiosResponse<User[]> = await axios.get('/api/users', config);
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      console.error('Fetch users failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<User[]> = await axios.get('/api/users', config);
          setUsers(response.data);
          setError('');
        }
      } else {
        setError(t('user_list.error_fetch') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Deleting user ID:', id);
      await axios.delete(`/api/users/${id}`, config);
      setUsers(prev => prev.filter(user => user.id !== id));
      setError('');
    } catch (err: any) {
      console.error('Delete user failed:', err.response?.data || err.message, 'Status:', err.response?.status);
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          await axios.delete(`/api/users/${id}`, config);
          setUsers(prev => prev.filter(user => user.id !== id));
          setError('');
        }
      } else {
        setError(t('user_list.error_delete') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('user_list.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      <Link
        to="/admin/users/new"
        className="bg-blue-600 text-white p-2 rounded mb-4 inline-block hover:bg-blue-700 transition-colors duration-200"
      >
        {t('user_list.add_user', 'Add New User')}
      </Link>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {users.length === 0 && !error && <p className="text-gray-600">{t('user_list.no_users')}</p>}
        <div className="grid gap-4">
          {users.map(user => (
            <div key={user.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="text-gray-700 font-semibold">{t('user_list.name')}: {user.name}</p>
                <p className="text-gray-600">{t('user_list.email')}: {user.email}</p>
                <p className="text-gray-600">{t('user_list.role')}: {user.role}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/users/${user.id}`}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                >
                  {t('user_list.edit')}
                </Link>
                <button
                  onClick={() => user.id && handleDelete(user.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  {t('user_list.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;