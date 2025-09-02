import React, { Suspense, useState, useEffect } from 'react';
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
import OrderAnalyticsDashboard from './components/OrderAnalyticsDashboard';
import CustomPizzaBuilder from './components/CustomPizzaBuilder';

const App: React.FC = () => {
  const [isTranslationsLoaded, setTranslationsLoaded] = useState(false);
  const [token, setToken] = useState<string>(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState<string>(localStorage.getItem('refreshToken') || '');
  const [email, setEmail] = useState<string>(localStorage.getItem('email') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || '');
  const [error, setError] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token && email && role) {
        try {
          await axios.get(`/api/users/email/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsLoading(false);
        } catch (err: any) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            try {
              const response = await axios.post('/api/auth/refresh', {
                email,
                refreshToken: localStorage.getItem('refreshToken') || ''
              });
              localStorage.setItem('accessToken', response.data.accessToken);
              localStorage.setItem('refreshToken', response.data.refreshToken);
              localStorage.setItem('email', response.data.email);
              localStorage.setItem('role', response.data.role);
              setToken(response.data.accessToken);
              setRefreshToken(response.data.refreshToken);
              setEmail(response.data.email);
              setRole(response.data.role);
              setIsLoading(false);
            } catch (refreshErr: any) {
              setError('Session expired. Please log in again.');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('email');
              localStorage.removeItem('role');
              setToken('');
              setRefreshToken('');
              setEmail('');
              setRole('');
              setIsLoading(false);
            }
          } else {
            setError('Authentication error: ' + (err.response?.data || err.message));
            setIsLoading(false);
          }
        }
      } else {
        setIsLoading(false);
      }
    };

    const checkTranslations = async () => {
      if (await isI18nInitialized()) {
        setTranslationsLoaded(true);
        await validateToken();
      } else {
        setTimeout(checkTranslations, 100);
      }
    };
    checkTranslations();
  }, []);

  const handleCheckout = async (items: CartItem[], loyaltyPoints: number, scheduledAt?: string) => {
    try {
      const userResponse = await axios.get(`/api/users/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userId = userResponse.data.id;
      await axios.post('/api/orders', { userId, items, loyaltyPoints, scheduledAt, customPizza: items.some(item => item.isCustomPizza) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
    } catch (err: any) {
      setError('Failed to checkout: ' + (err.response?.data || err.message));
    }
  };

  const addToCart = (item: CartItem) => {
    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(cartItem => {
      if (item.isCustomPizza && cartItem.isCustomPizza) {
        return JSON.stringify(cartItem.ingredients?.map(i => i.id).sort()) === JSON.stringify(item.ingredients?.map(i => i.id).sort());
      }
      return cartItem.productId === item.productId;
    });
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      updatedCart.push({ ...item, id: Date.now() });
    }
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  if (!isTranslationsLoaded || isLoading) {
    return <div>Loading...</div>;
  }

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
        return '/client';
      default:
        return '/';
    }
  };

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
          <Routes>
            <Route
              path="/"
              element={
                token ? (
                  role === 'ROLE_C' ? (
                    <ClientDashboard token={token} email={email} cartItems={cartItems} setCartItems={setCartItems} setToken={setToken} setRole={setRole} setError={setError}/>
                  ) : (
                    <Navigate to={getHomePath()} />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/login" element={<LoginForm setToken={setToken} setRefreshToken={setRefreshToken} setEmail={setEmail} setRole={setRole} setError={setError} />} />
            <Route path="/register" element={<RegisterForm setError={setError} />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm setError={setError} />} />
            <Route path="/reset-password" element={<ResetPasswordForm setError={setError} />} />
            <Route path="/admin" element={token && role === 'ROLE_A' ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/analytics" element={role === 'ROLE_A' ? <OrderAnalyticsDashboard token={token} /> : <Navigate to="/login" />} />
            <Route path="/admin/users" element={token && role === 'ROLE_A' ? <UserList /> : <Navigate to="/login" />} />
            <Route path="/admin/users/new" element={token && role === 'ROLE_A' ? <UserForm /> : <Navigate to="/login" />} />
            <Route path="/admin/users/:id" element={token && role === 'ROLE_A' ? <UserDetails /> : <Navigate to="/login" />} />
            <Route path="/admin/orders" element={token && role === 'ROLE_A' ? <AdminOrders /> : <Navigate to="/login" />} />
            <Route path="/admin/products" element={token && role === 'ROLE_A' ? <ProductManagement /> : <Navigate to="/login" />} />
            <Route path="/client" element={token && role === 'ROLE_C' ? <ClientDashboard token={token} email={email} cartItems={cartItems} setCartItems={setCartItems} setToken={setToken} setRole={setRole} setError={setError} /> : <Navigate to="/login" />} />
            <Route path="/kitchen" element={token && role === 'ROLE_K' ? <KitchenDashboard /> : <Navigate to="/login" />} />
            <Route path="/delivery" element={token && role === 'ROLE_D' ? <DeliveryDashboard /> : <Navigate to="/login" />} />
            <Route path="/waiter" element={token && role === 'ROLE_W' ? <WaiterDashboard /> : <Navigate to="/login" />} />
            <Route path="/cart" element={token && role === 'ROLE_C' ? <Cart onCheckout={handleCheckout} token={token} cartItems={cartItems} setCartItems={setCartItems} /> : <Navigate to="/login" />} />
            <Route path="/custom-pizza" element={<CustomPizzaBuilder token={token} addToCart={addToCart} />} />
            <Route path="/orders/new" element={token && (role === 'ROLE_A' || role === 'ROLE_W') ? <OrderForm /> : <Navigate to="/login" />} />
            <Route path="/orders/client" element={token && role === 'ROLE_C' ? <OrderHistory /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
};

export default App;