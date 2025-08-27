import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setError }) => {
  const [error, setLocalError] = useState<string>('');
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'C',
  });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting registration with:', user);
      await axios.post('/api/auth/register', user);
      setError('');
      setLocalError('');
      console.log('Registration successful');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = 'Registration failed: ' + (err.response?.data || err.message);
      console.error(errorMessage);
      setError(errorMessage);
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block">Name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterForm;