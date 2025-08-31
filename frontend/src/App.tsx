import React, { Suspense, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import NavBar from './components/NavBar';
import ClientDashboard from './components/ClientDashboard';
import ProductManagement from './components/ProductManagement';
import AdminOrders from './components/AdminOrders';
import WaiterDashboard from './components/WaiterDashboard';
import KitchenDashboard from './components/KitchenDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import UserDetails from './components/UserDetails';
import Cart from './components/Cart';
import { useTranslation } from 'react-i18next';
import { CartItem, User } from './types';
import { CartProvider } from './contexts/CartContext';
import './index.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string>(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState<string>(localStorage.getItem('refreshToken') || '');
  const [email, setEmail] = useState<string>(localStorage.getItem('email') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || '');
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const { ready } = useTranslation();

  useEffect(() => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
  }, [token, refreshToken, email, role]);

  useEffect(() => {
    const fetchUserId = async () => {
      if (token && email) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response: AxiosResponse<User> = await axios.get(`/api/users/email/${email}`, config);
          setUserId(response.data.id || null);
        } catch (err: any) {
          console.error('Failed to fetch user ID:', err.response?.status, err.response?.data || err.message);
          setError('Failed to fetch user ID. Please log in again.');
          setToken('');
          setRefreshToken('');
          setEmail('');
          setRole('');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('email');
          localStorage.removeItem('role');
        }
      }
    };
    fetchUserId();
  }, [token, email]);

  const handleCheckout = async (items: CartItem[]) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to checkout.');
        return;
      }
      if (!userId) {
        setError('User ID not available.');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const order = {
        userId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: items.reduce((total, item) => total + item.quantity * item.price, 0),
        status: 'PE',
        createdBy: localStorage.getItem('email') || 'system',
        modifiedBy: localStorage.getItem('email') || 'system'
      };
      await axios.post('/api/orders', order, config);
      setError('');
      window.location.href = '/orders';
    } catch (err: any) {
      setError('Failed to place order: ' + (err.response?.data || err.message));
    }
  };

  const getHomePath = () => {
    if (!token) {
      return '/login';
    }
    switch (role) {
      case 'ROLE_A':
        return '/admin';
      case 'ROLE_K':
        return '/kitchen';
      case 'ROLE_D':
        return '/delivery';
      case 'ROLE_W':
        return '/waiter';
      case 'ROLE_C':
      default:
        return '/';
    }
  };

  if (!ready) {
    return <div className="container mx-auto p-6 text-center">Loading translations...</div>;
  }

  return (
    <Router>
      <Suspense fallback={<div className="container mx-auto p-6 text-center">Loading...</div>}>
        <NavBar
          token={token}
          role={role}
          setToken={setToken}
          setRefreshToken={setRefreshToken}
          setEmail={setEmail}
          setRole={setRole}
        />
        <div className="container mx-auto p-6">
          {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
          <CartProvider>
            <Routes>
              <Route
                path="/"
                element={
                  token ? (
                    role === 'ROLE_C' ? (
                      <ClientDashboard />
                    ) : (
                      <Navigate to={getHomePath()} />
                    )
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="/client" element={<Navigate to="/" />} />
              <Route path="/cart" element={token && role === 'ROLE_C' ? <Cart onCheckout={handleCheckout} /> : <Navigate to="/login" />} />
              <Route path="/orders/new" element={token && (role === 'ROLE_A' || role === 'ROLE_W') ? <OrderForm /> : <Navigate to="/login" />} />
              <Route path="/orders" element={token && role === 'ROLE_C' ? <OrderHistory /> : <Navigate to="/login" />} />
              <Route path="/login" element={<LoginForm setToken={setToken} setRefreshToken={setRefreshToken} setEmail={setEmail} setRole={setRole} setError={setError} />} />
              <Route path="/register" element={<RegisterForm setError={setError} />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm setError={setError} />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/admin" element={token && role === 'ROLE_A' ? <AdminDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin/users" element={token && role === 'ROLE_A' ? <UserList /> : <Navigate to="/login" />} />
              <Route path="/admin/users/new" element={token && role === 'ROLE_A' ? <UserForm /> : <Navigate to="/login" />} />
              <Route path="/admin/users/:id" element={token && role === 'ROLE_A' ? <UserDetails /> : <Navigate to="/login" />} />
              <Route path="/admin/orders" element={token && role === 'ROLE_A' ? <AdminOrders /> : <Navigate to="/login" />} />
              <Route path="/admin/products" element={token && role === 'ROLE_A' ? <ProductManagement /> : <Navigate to="/login" />} />
              <Route path="/kitchen" element={token && role === 'ROLE_K' ? <KitchenDashboard /> : <Navigate to="/login" />} />
              <Route path="/delivery" element={token && role === 'ROLE_D' ? <DeliveryDashboard /> : <Navigate to="/login" />} />
              <Route path="/waiter" element={token && role === 'ROLE_W' ? <WaiterDashboard /> : <Navigate to="/login" />} />
            </Routes>
          </CartProvider>
        </div>
      </Suspense>
    </Router>
  );
};

export default App;