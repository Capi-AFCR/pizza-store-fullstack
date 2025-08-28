import React from 'react';
import { User } from '../types';

interface UserDetailsProps {
  user: User;
  setViewingUser: (user: User | null) => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, setViewingUser }) => {
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
      <h3 className="text-xl font-bold mb-4 text-gray-800">User Details</h3>
      <div className="space-y-2">
        <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
        <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
        <div>
          <p className="text-gray-700"><strong>Role:</strong></p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${roleStyles[user.role] || 'bg-gray-100 text-gray-800'}`}>
            {roleNames[user.role] || user.role}
          </span>
        </div>
        <p className="text-gray-700"><strong>Active:</strong> {user.active ? 'Yes' : 'No'}</p>
        <p className="text-gray-700"><strong>Created By:</strong> {user.createdBy}</p>
        <p className="text-gray-700"><strong>Created At:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
        <p className="text-gray-700"><strong>Modified By:</strong> {user.modifiedBy}</p>
        <p className="text-gray-700"><strong>Modified At:</strong> {user.modifiedAt ? new Date(user.modifiedAt).toLocaleString() : 'N/A'}</p>
      </div>
      <button
        onClick={() => setViewingUser(null)}
        className="mt-4 bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200"
      >
        Back to User List
      </button>
    </div>
  );
};

export default UserDetails;