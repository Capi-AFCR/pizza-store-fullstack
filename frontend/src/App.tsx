import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import Home from './components/Home';
import NavBar from './components/NavBar';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import AdminOrders from './components/AdminOrders';
import { User } from './types';
import './index.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string>(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState<string>(localStorage.getItem('refreshToken') || '');
  const [email, setEmail] = useState<string>(localStorage.getItem('email') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || '');
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      console.log('Fetching users with config:', config);
      const response: AxiosResponse<User[]> = await axios.get('/api/users', config);
      console.log('Users fetched:', response.data);
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401 && refreshToken && email) {
        await refreshAccessToken();
      } else {
        const errorMessage = 'Failed to fetch users: ' + (err.response?.data || err.message);
        console.error(errorMessage);
        setError(errorMessage);
      }
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response: AxiosResponse<{ accessToken: string; refreshToken: string; role: string }> = await axios.post('/api/auth/refresh', {
        email,
        refreshToken
      });
      setToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setRole(response.data.role); // Expecting 'ROLE_A', 'ROLE_C', etc.
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      if (response.data.role === 'ROLE_A') {
        fetchUsers();
      }
    } catch (err: any) {
      setError('Failed to refresh token: ' + (err.response?.data || err.message));
      setToken('');
      setRefreshToken('');
      setEmail('');
      setRole('');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
    }
  };

  const updateUser = async (user: User) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(`/api/users/${user.id}`, user, config);
      setEditingUser(null);
      fetchUsers();
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401 && refreshToken && email) {
        await refreshAccessToken();
      } else {
        setError('Failed to update user: ' + (err.response?.data || err.message));
      }
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`/api/users/${id}`, config);
      fetchUsers();
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401 && refreshToken && email) {
        await refreshAccessToken();
      } else {
        setError('Failed to delete user: ' + (err.response?.data || err.message));
      }
    }
  };

  useEffect(() => {
    console.log('Token:', token);
    if (token && role === 'ROLE_A') {
      fetchUsers();
    }
  }, [token, role]);

  return (
    <Router>
      <NavBar
        token={token}
        role={role}
        setToken={setToken}
        setRefreshToken={setRefreshToken}
        setEmail={setEmail}
        setRole={setRole}
      />
      <Routes>
        <Route path="/login" element={<LoginForm setToken={setToken} setRefreshToken={setRefreshToken} setEmail={setEmail} setRole={setRole} setError={setError} />} />
        <Route path="/register" element={<RegisterForm setError={setError} />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm setError={setError} />} />
        <Route path="/reset-password" element={<ResetPasswordForm setError={setError} />} />
        <Route
          path="/admin/users"
          element={
            token && role === 'ROLE_A' ? (
              <div className="container mx-auto p-4 space-y-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                {viewingUser ? (
                  <UserDetails user={viewingUser} setViewingUser={setViewingUser} />
                ) : (
                  <>
                    <UserForm fetchUsers={fetchUsers} token={token} setError={setError} editingUser={editingUser} updateUser={updateUser} />
                    <UserList users={users} error={error} setEditingUser={setEditingUser} deleteUser={deleteUser} setViewingUser={setViewingUser} />
                  </>
                )}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/orders"
          element={
            token && role === 'ROLE_A' ? (
              <AdminOrders />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/orders"
          element={
            token ? (
              <OrderHistory />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/orders/new"
          element={
            token ? (
              <OrderForm />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;