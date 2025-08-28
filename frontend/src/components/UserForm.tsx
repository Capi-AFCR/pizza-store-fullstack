import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { User, Role } from '../types';

interface UserFormProps {
  fetchUsers: () => void;
  token: string;
  setError: (error: string) => void;
  editingUser: User | null;
  updateUser: (user: User) => void;
}

const UserForm: React.FC<UserFormProps> = ({ fetchUsers, token, setError, editingUser, updateUser }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<Role | ''>('');
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setPassword('');
      setRole(editingUser.role);
      setActive(editingUser.active);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setActive(true);
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingUser && editingUser.id) {
        await updateUser({ id: editingUser.id, name, email, password: password || undefined, role, active });
      } else {
        await axios.post('/api/users', { name, email, password, role, active }, config);
        fetchUsers();
      }
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setActive(true);
    } catch (err: any) {
      setError('Failed to save user: ' + (err.response?.data || err.message));
    }
  };

  const roleNames: { [key in Role]: string } = {
    A: 'Admin',
    D: 'Delivery',
    W: 'Waiter',
    C: 'Client',
    K: 'Kitchen'
  };

  const roleStyles: { [key in Role]: string } = {
    A: 'bg-blue-100 text-blue-800',
    D: 'bg-green-100 text-green-800',
    W: 'bg-yellow-100 text-yellow-800',
    C: 'bg-purple-100 text-purple-800',
    K: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{editingUser ? 'Edit User' : 'Create User'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password {editingUser ? '(leave blank to keep unchanged)' : ''}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required={!editingUser}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Select Role</option>
            {Object.keys(roleNames).map(key => (
              <option key={key} value={key}>{roleNames[key as Role]}</option>
            ))}
          </select>
          {role && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleStyles[role as Role]}`}>
              {roleNames[role as Role]}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Active</label>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded w-full hover:bg-green-700 transition-colors duration-200"
        >
          {editingUser ? 'Update User' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;