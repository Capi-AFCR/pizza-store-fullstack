import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

const UserDetails: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
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
      setError(t('user_details.error_token'));
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      navigate('/login');
      return null;
    }
  };

  const fetchUser = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response: AxiosResponse<User> = await axios.get(`/api/users/${id}`, config);
      setUser(response.data);
      setError('');
    } catch (err: any) {
      if ((err.response?.status === 401 || err.response?.status === 403) && localStorage.getItem('refreshToken') && localStorage.getItem('email')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const config = { headers: { Authorization: `Bearer ${newToken}` } };
          const response: AxiosResponse<User> = await axios.get(`/api/users/${id}`, config);
          setUser(response.data);
          setError('');
        }
      } else {
        setError(t('user_details.error_fetch') + ' ' + (err.response?.data || err.message));
      }
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id, token]);

  if (!user) return <div className="container mx-auto p-6">{error || t('user_details.loading', 'Loading...')}</div>;

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('user_details.title')}</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700"><strong>{t('user_details.name')}:</strong> {user.name}</p>
        <p className="text-gray-700"><strong>{t('user_details.email')}:</strong> {user.email}</p>
        <p className="text-gray-700"><strong>{t('user_details.role')}:</strong> {user.role}</p>
        <p className="text-gray-700"><strong>{t('user_details.active')}:</strong> {user.active ? t('user_details.active_yes', 'Yes') : t('user_details.active_no', 'No')}</p>
        <p className="text-gray-700"><strong>{t('user_details.created_by')}:</strong> {user.createdBy}</p>
        <p className="text-gray-700"><strong>{t('user_details.modified_by')}:</strong> {user.modifiedBy}</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-blue-600 text-white p-2 rounded w-full mt-4 hover:bg-blue-700 transition-colors duration-200"
        >
          {t('user_details.back', 'Back to User List')}
        </button>
      </div>
    </div>
  );
};

export default UserDetails;