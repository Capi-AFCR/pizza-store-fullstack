import React, { Dispatch, SetStateAction } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavBarProps {
  token: string;
  role: string;
  setToken: Dispatch<SetStateAction<string>>;
  setRefreshToken: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setRole: Dispatch<SetStateAction<string>>;
}

const NavBar: React.FC<NavBarProps> = ({ token, role, setToken, setRefreshToken, setEmail, setRole }) => {
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

  // Determine redirect path based on role
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

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={getHomePath()} className="text-2xl font-bold">Pizza Store</Link>
        <div className="flex space-x-4">
          {token ? (
            <>
              {role === 'ROLE_A' && (
                <>
                  <Link
                    to="/admin/users"
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/products"
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Manage Products
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Manage Orders
                  </Link>
                </>
              )}
              {role === 'ROLE_K' && (
                <Link
                  to="/kitchen"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Kitchen
                </Link>
              )}
              {role === 'ROLE_D' && (
                <Link
                  to="/delivery"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Delivery
                </Link>
              )}
              {role === 'ROLE_W' && (
                <Link
                  to="/waiter"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Waiter
                </Link>
              )}
              {(role === 'ROLE_C') && (
                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Orders
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;