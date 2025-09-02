import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from '../i18n';

interface NavBarProps {
  token: string;
  role: string;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setEmail: (email: string) => void;
  setRole: (role: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ token, role, setToken, setRefreshToken, setEmail, setRole }) => {
  const { t, i18n, ready } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setToken('');
    setRefreshToken('');
    setEmail('');
    setRole('');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      await i18next.changeLanguage(lang);
      localStorage.setItem('language', lang);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
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
        return '/client';
      default:
        return '/';
    }
  };

  if (!ready) {
    return <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 text-center">Loading...</div>;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to={getHomePath()}
          className="text-white text-2xl font-semibold tracking-tight hover:text-blue-200 transition-colors duration-300"
        >
          {t('navbar.title')}
        </Link>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-blue-800 md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none transition-all duration-300 ease-in-out`}
        >
          {token && role === 'ROLE_A' && (
            <>
              <Link
                to="/admin/users"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.manage_users')}
              </Link>
              <Link
                to="/admin/products"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.manage_products')}
              </Link>
              <Link
                to="/admin/orders"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.manage_orders')}
              </Link>
              <Link
                to="/orders/new"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('order_form.title')}
              </Link>
            </>
          )}
          {token && role === 'ROLE_K' && (
            <Link
              to="/kitchen"
              className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navbar.kitchen')}
            </Link>
          )}
          {token && role === 'ROLE_D' && (
            <Link
              to="/delivery"
              className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navbar.delivery')}
            </Link>
          )}
          {token && role === 'ROLE_W' && (
            <>
              <Link
                to="/waiter"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.waiter')}
              </Link>
              <Link
                to="/orders/new"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('order_form.title')}
              </Link>
            </>
          )}
          {token && role === 'ROLE_C' && (
            <>
              <Link
                to="/orders"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.orders')}
              </Link>
            </>
          )}
          {token ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
            >
              {t('navbar.logout')}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.login')}
              </Link>
              <Link
                to="/register"
                className="text-white text-base font-medium py-2 md:py-0 hover:text-blue-200 hover:underline transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.register')}
              </Link>
            </>
          )}
          <select
            onChange={(e) => handleLanguageChange(e.target.value)}
            value={i18n.language}
            className="border p-2 rounded text-base bg-blue-600 text-white focus:ring-2 focus:ring-blue-300 mt-2 md:mt-0"
          >
            <option value="en">{t('navbar.language_en')}</option>
            <option value="es">{t('navbar.language_es')}</option>
            <option value="fr">{t('navbar.language_fr')}</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;