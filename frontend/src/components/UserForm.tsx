import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface UserFormProps {
  fetchUsers: () => void;
  token: string;
  setError: (error: string) => void;
  editingUser: User | null;
  updateUser: (user: User) => void;
}

const UserForm: React.FC<UserFormProps> = ({ fetchUsers, token, setError, editingUser, updateUser }) => {
  const [newUser, setNewUser] = useState<User>({
    name: '',
    email: '',
    password: '',
    role: 'A',
    active: true,
  });

  useEffect(() => {
    if (editingUser) {
      setNewUser({
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        role: editingUser.role,
        active: editingUser.active,
      });
    } else {
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'A',
        active: true,
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { auth: { username: 'admin@example.com', password: 'password' } };
      if (editingUser && editingUser.id) {
        await updateUser({ ...newUser, id: editingUser.id });
      } else {
        await axios.post('/api/users', newUser, config);
        fetchUsers();
      }
      setNewUser({ name: '', email: '', password: '', role: 'A', active: true });
      setError('');
    } catch (err: any) {
      setError('Failed to save user: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded">
      <h2 className="text-xl mb-4">{editingUser ? 'Update User' : 'Create User'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Name</label>
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block">Email</label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border p-2 w-full rounded"
            required={!editingUser}
            placeholder={editingUser ? 'Leave blank to keep unchanged' : ''}
          />
        </div>
        <div>
          <label className="block">Role</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'A' | 'D' | 'W' | 'C' })}
            className="border p-2 w-full rounded"
            required
          >
            <option value="A">Admin</option>
            <option value="D">Delivery</option>
            <option value="W">Waiter</option>
            <option value="C">Client</option>
          </select>
        </div>
        <div>
          <label className="block">Active</label>
          <input
            type="checkbox"
            checked={newUser.active}
            onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
            className="h-5 w-5"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          {editingUser ? 'Update User' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;