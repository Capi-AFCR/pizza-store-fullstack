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
  return (
    <div>
      <h2 className="text-xl mb-4">Users</h2>
      {error && <p className="text-red-500">{error}</p>}
      {users.length === 0 && !error && <p>No users found.</p>}
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="border p-2 rounded flex justify-between items-center">
            <span>
              {user.name} ({user.email}) - Role: {user.role}, Active: {user.active ? 'Yes' : 'No'}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setViewingUser(user)}
                className="bg-gray-500 text-white p-1 rounded"
              >
                View
              </button>
              <button
                onClick={() => setEditingUser(user)}
                className="bg-blue-500 text-white p-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteUser(user.id!)}
                className="bg-red-500 text-white p-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;