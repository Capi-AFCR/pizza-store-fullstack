import React, { useState, Dispatch, SetStateAction } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface UserFormProps {
  setError: Dispatch<SetStateAction<string>>;
}

const UserForm: React.FC<UserFormProps> = ({ setError }) => {
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: '',
    role: 'C',
    active: true,
    createdBy: 'system',
    modifiedBy: 'system'
  });
  const [error, setLocalError] = useState<string>(''); // Local error state
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Creating user:', formData);
      const response: AxiosResponse<User> = await axios.post('/api/users', formData, config);
      setLocalError('');
      navigate('/admin/users');
    } catch (err: any) {
      console.error('Create user failed:', err.response?.data || err.message);
      setLocalError(err.response?.data || 'Failed to create user');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New User</h2>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'A' | 'C' | 'K' | 'D' | 'W' })}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="A">Admin</option>
            <option value="C">Client</option>
            <option value="K">Kitchen</option>
            <option value="D">Delivery</option>
            <option value="W">Waiter</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default UserForm;