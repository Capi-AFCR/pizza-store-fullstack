import React, { useState, Dispatch, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  setToken: Dispatch<SetStateAction<string>>;
  setRefreshToken: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setRole: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ setToken, setRefreshToken, setEmail, setRole, setError }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/login', {
        username,
        password,
      });
      setToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setEmail(username);
      setRole(response.data.role);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('email', username);
      localStorage.setItem('role', response.data.role);
      setError('');
      // Redirect to role-specific dashboard
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
          navigate('/client');
          break;
        default:
          navigate('/login');
      }
    } catch (err: any) {
      setError('Login failed: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
        >
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
        <p className="text-gray-600">
          Forgot your password?{' '}
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Reset Password
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;