import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
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
import { isI18nInitialized } from './i18n';
import { CartItem, User } from './types';
import './index.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string>(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState<string>(localStorage.getItem('refreshToken') || '');
  const [email, setEmail] = useState<string>(localStorage.getItem('email') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || '');
  const [error, setError] = useState<string>('');
  const [isTranslationsLoaded, setIsTranslationsLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
  }, [token, refreshToken, email, role]);

  useEffect(() => {
    const checkTranslations = async () => {
      if (!isI18nInitialized()) {
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (isI18nInitialized()) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }
      setIsTranslationsLoaded(true);
    };
    checkTranslations();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      if (token && email) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response: AxiosResponse<User> = await axios.get(`/api/users/email/${email}`, config);
          setUserId(response.data.id || null);
        } catch (err: any) {
          setError('Failed to fetch user ID: ' + (err.response?.data || err.message));
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
          productId: item.id, // Use 'id' from CartItem (inherited from Product)
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

  if (!isTranslationsLoaded) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-600">Loading translations...</p>
      </div>
    );
  }

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
      <div className="container mx-auto p-6">
        {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route path="/cart" element={<Cart onCheckout={handleCheckout} />} />
          <Route path="/orders/new" element={(role === 'ROLE_A' || role === 'ROLE_W') ? <OrderForm /> : <Navigate to="/login" />} />
          <Route path="/orders" element={(role === 'ROLE_A' || role === 'ROLE_C') ? <OrderHistory /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginForm setToken={setToken} setRefreshToken={setRefreshToken} setEmail={setEmail} setRole={setRole} setError={setError} />} />
          <Route path="/register" element={<RegisterForm setError={setError} />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm setError={setError} />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/admin" element={role === 'ROLE_A' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={role === 'ROLE_A' ? <UserList /> : <Navigate to="/login" />} />
          <Route path="/admin/users/new" element={role === 'ROLE_A' ? <UserForm /> : <Navigate to="/login" />} />
          <Route path="/admin/users/:id" element={role === 'ROLE_A' ? <UserDetails /> : <Navigate to="/login" />} />
          <Route path="/admin/orders" element={role === 'ROLE_A' ? <AdminOrders /> : <Navigate to="/login" />} />
          <Route path="/admin/products" element={role === 'ROLE_A' ? <ProductManagement /> : <Navigate to="/login" />} />
          <Route path="/kitchen" element={role === 'ROLE_K' ? <KitchenDashboard /> : <Navigate to="/login" />} />
          <Route path="/delivery" element={role === 'ROLE_D' ? <DeliveryDashboard /> : <Navigate to="/login" />} />
          <Route path="/waiter" element={role === 'ROLE_W' ? <WaiterDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;