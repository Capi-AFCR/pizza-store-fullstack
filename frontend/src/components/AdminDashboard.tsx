import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/users"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">Manage Users</h3>
          <p className="mt-2">View, edit, or delete user accounts.</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">Manage Orders</h3>
          <p className="mt-2">View and update order statuses.</p>
        </Link>
        <Link
          to="/orders/new"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">Create Order for Client</h3>
          <p className="mt-2">Place a new order for a client.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;