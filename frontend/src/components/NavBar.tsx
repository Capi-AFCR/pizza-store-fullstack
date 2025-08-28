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
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">Pizza Store</Link>
      </div>
      <div className="space-x-4">
        {token && (
          <Link
            to="/orders"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Orders
          </Link>
        )}
        {token && role === 'ROLE_A' && (
          <Link
            to="/admin/users"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Users
          </Link>
        )}
        {token && role === 'ROLE_A' && (
          <Link
            to="/admin/orders"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Manage Orders
          </Link>
        )}
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;