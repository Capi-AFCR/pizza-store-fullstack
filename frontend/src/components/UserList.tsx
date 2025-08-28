import React from 'react';
import { User } from '../types';

interface UserListProps {
  users: User[];
  error: string;
  setEditingUser: (user: User | null) => void;
  deleteUser: (id: number) => void;
  setViewingUser: (user: User | null) => void;
}

const UserList: React.FC<UserListProps> = ({ users, error, setEditingUser, deleteUser, setViewingUser }) => {
  const roleNames: { [key: string]: string } = {
    ROLE_A: 'Admin',
    ROLE_D: 'Delivery',
    ROLE_W: 'Waiter',
    ROLE_C: 'Client',
    ROLE_K: 'Kitchen'
  };

  const roleStyles: { [key: string]: string } = {
    ROLE_A: 'bg-blue-100 text-blue-800',
    ROLE_D: 'bg-green-100 text-green-800',
    ROLE_W: 'bg-yellow-100 text-yellow-800',
    ROLE_C: 'bg-purple-100 text-purple-800',
    ROLE_K: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">User List</h3>
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {users.length === 0 && !error && <p className="text-gray-600">No users found.</p>}
      <div className="grid gap-4">
        {users.map(user => (
          <div
            key={user.id || Math.random()}
            className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                <p className="text-gray-600">{user.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleStyles[user.role] || 'bg-gray-100 text-gray-800'}`}>
                  {roleNames[user.role] || user.role}
                </span>
                <p className="text-sm text-gray-500 mt-1">Active: {user.active ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="relative group bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  Edit
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-10">
                    Edit user details
                  </div>
                </button>
                <button
                  onClick={() => user.id && deleteUser(user.id)}
                  className="relative group bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-10">
                    Delete user
                  </div>
                </button>
                <button
                  onClick={() => setViewingUser(user)}
                  className="relative group bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors duration-200"
                >
                  View
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-10">
                    View user details
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;