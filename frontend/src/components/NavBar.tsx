import React, { Dispatch, SetStateAction } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

interface NavBarProps {
  token: string;
  role: string;
  setToken: Dispatch<SetStateAction<string>>;
  setRefreshToken: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setRole: Dispatch<SetStateAction<string>>;
}

const NavBar: React.FC<NavBarProps> = ({ token, role, setToken, setRefreshToken, setEmail, setRole }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const getHomePath = () => {
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={getHomePath()} className="text-2xl font-bold">{t('navbar.title')}</Link>
        <div className="flex space-x-4 items-center">
          {token ? (
            <>
              {role === 'ROLE_A' && (
                <>
                  <Link
                    to="/admin/users"
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    {t('navbar.manage_users')}
                  </Link>
                  <Link
                    to="/admin/products"
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    {t('navbar.manage_products')}
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    {t('navbar.manage_orders')}
                  </Link>
                </>
              )}
              {role === 'ROLE_K' && (
                <Link
                  to="/kitchen"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  {t('navbar.kitchen')}
                </Link>
              )}
              {role === 'ROLE_D' && (
                <Link
                  to="/delivery"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  {t('navbar.delivery')}
                </Link>
              )}
              {role === 'ROLE_W' && (
                <Link
                  to="/waiter"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  {t('navbar.waiter')}
                </Link>
              )}
              {(role === 'ROLE_C') && (
                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  {t('navbar.orders')}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {t('navbar.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {t('navbar.login')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {t('navbar.register')}
              </Link>
            </>
          )}
          <select
            onChange={handleLanguageChange}
            className="border p-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition-colors duration-200"
            defaultValue={localStorage.getItem('language') || 'en'}
          >
            <option value="en">{t('navbar.language_en', 'English')}</option>
            <option value="es">{t('navbar.language_es', 'Español')}</option>
            <option value="fr">{t('navbar.language_fr', 'Français')}</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;