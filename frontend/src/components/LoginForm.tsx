import React, { useState, Dispatch, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormProps {
  setToken: Dispatch<SetStateAction<string>>;
  setRefreshToken: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setRole: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ setToken, setRefreshToken, setEmail, setRole, setError }) => {
  const [error, setLocalError] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { username, password });
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/login', {
        username,
        password,
      });
      setToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setEmail(username);
      setRole(response.data.role); // Expecting 'ROLE_A', 'ROLE_C', etc.
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('email', username);
      localStorage.setItem('role', response.data.role);
      setError('');
      setLocalError('');
      console.log('Login successful:', response.data);
      navigate('/');
    } catch (err: any) {
      const errorMessage = 'Login failed: ' + (err.response?.data || err.message);
      console.error(errorMessage);
      setError(errorMessage);
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>Don't have an account? <Link to="/register" className="text-blue-500">Register</Link></p>
        <p><Link to="/forgot-password" className="text-blue-500">Forgot Password?</Link></p>
      </div>
    </div>
  );
};

export default LoginForm;