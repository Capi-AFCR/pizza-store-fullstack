import React, { useState, Dispatch, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  setToken: Dispatch<SetStateAction<string>>;
  setRefreshToken: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setRole: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ setToken, setRefreshToken, setEmail, setRole, setError }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post('/api/auth/login', {
        username,
        password,
      });
      setToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setEmail(response.data.email);
      setRole(response.data.role);
      setError('');
      setLocalError('');

      // Redirect based on role
      switch (response.data.role) {
        case 'ROLE_A':
          navigate('/admin');
          break;
        case 'ROLE_K':
          navigate('/kitchen');
          break;
        case 'ROLE_D':
          navigate('/delivery');
          break;
        case 'ROLE_W':
          navigate('/waiter');
          break;
        case 'ROLE_C':
        default:
          navigate('/');
          break;
      }
    } catch (err: any) {
      const errorMessage = t('login_form.error') + ' ' + (err.response?.data || err.message);
      setError(errorMessage);
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('login_form.title')}</h2>
      {localError && <p className="text-red-500 mb-4 font-semibold">{localError}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('login_form.username')}</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">{t('login_form.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
        >
          {t('login_form.submit')}
        </button>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            {t('login_form.forgot_password')}
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;