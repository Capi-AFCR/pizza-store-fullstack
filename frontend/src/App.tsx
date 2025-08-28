import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import AdminOrders from './components/AdminOrders';
import AdminDashboard from './components/AdminDashboard';
import KitchenDashboard from './components/KitchenDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import WaiterDashboard from './components/WaiterDashboard';
import ClientDashboard from './components/ClientDashboard';
import ProductManagement from './components/ProductManagement';
import { CartProvider } from './CartContext';

const App: React.FC = () => {
  const [token, setToken] = useState<string>(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState<string>(localStorage.getItem('refreshToken') || '');
  const [email, setEmail] = useState<string>(localStorage.getItem('email') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || '');
  const [error, setError] = useState<string>('');

  return (
    <CartProvider>
      <Router>
        <NavBar token={token} role={role} setToken={setToken} setRefreshToken={setRefreshToken} setEmail={setEmail} setRole={setRole} />
        <Routes>
          <Route path="/" element={<ClientDashboard />} />
          <Route path="/login" element={<LoginForm setToken={setToken} setRefreshToken={setRefreshToken} setEmail={setEmail} setRole={setRole} setError={setError} />} />
          <Route path="/register" element={<RegisterForm setError={setError} />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm setError={setError} />} />
          <Route path="/reset-password" element={<ResetPasswordForm setError={setError} />} />
          <Route path="/admin" element={role === 'ROLE_A' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={role === 'ROLE_A' ? <UserList setError={setError} /> : <Navigate to="/login" />} />
          <Route path="/admin/users/new" element={role === 'ROLE_A' ? <UserForm setError={setError} /> : <Navigate to="/login" />} />
          <Route path="/admin/users/:id" element={role === 'ROLE_A' ? <UserDetails setError={setError} /> : <Navigate to="/login" />} />
          <Route path="/admin/orders" element={role === 'ROLE_A' ? <AdminOrders /> : <Navigate to="/login" />} />
          <Route path="/admin/products" element={role === 'ROLE_A' ? <ProductManagement /> : <Navigate to="/login" />} />
          <Route path="/kitchen" element={role === 'ROLE_K' ? <KitchenDashboard /> : <Navigate to="/login" />} />
          <Route path="/delivery" element={role === 'ROLE_D' ? <DeliveryDashboard /> : <Navigate to="/login" />} />
          <Route path="/waiter" element={role === 'ROLE_W' ? <WaiterDashboard /> : <Navigate to="/login" />} />
          <Route path="/orders" element={role === 'ROLE_C' ? <OrderHistory /> : <Navigate to="/login" />} />
          <Route path="/orders/new" element={['ROLE_W', 'ROLE_A'].includes(role) ? <OrderForm /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;