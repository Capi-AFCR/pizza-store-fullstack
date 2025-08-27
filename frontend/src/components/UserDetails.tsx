import React from 'react';
import { User } from '../types';

interface UserDetailsProps {
  user: User;
  setViewingUser: (user: User | null) => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, setViewingUser }) => {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <h2 className="text-xl mb-4">User Details</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Active:</strong> {user.active ? 'Yes' : 'No'}</p>
        <p><strong>Created By:</strong> {user.createdBy || 'N/A'}</p>
        <p><strong>Modified By:</strong> {user.modifiedBy || 'N/A'}</p>
        <p><strong>Created At:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Modified At:</strong> {user.modifiedAt ? new Date(user.modifiedAt).toLocaleString() : 'N/A'}</p>
      </div>
      <button
        onClick={() => setViewingUser(null)}
        className="bg-blue-500 text-white p-2 rounded mt-4"
      >
        Back to List
      </button>
    </div>
  );
};

export default UserDetails;