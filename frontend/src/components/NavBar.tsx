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

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">
        <Link to="/">Pizza Store</Link>
      </div>
      <div className="space-x-4">
        {token && (role === 'ROLE_A' || role === 'ROLE_C' || role === 'ROLE_K' || role === 'ROLE_D' || role === 'ROLE_W') && (
          <Link
            to={
              role === 'ROLE_A' ? '/admin' :
              role === 'ROLE_K' ? '/kitchen' :
              role === 'ROLE_D' ? '/delivery' :
              role === 'ROLE_W' ? '/waiter' : '/'
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Dashboard
          </Link>
        )}
        {token && (role === 'ROLE_C') && (
          <Link
            to="/orders"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Orders
          </Link>
        )}
        {token && role === 'ROLE_A' && (
          <Link
            to="/admin/users"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Users
          </Link>
        )}
        {token && role === 'ROLE_A' && (
          <Link
            to="/admin/orders"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Manage Orders
          </Link>
        )}
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Logout
          </button>
        )}
        {!token && (
          <>
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;