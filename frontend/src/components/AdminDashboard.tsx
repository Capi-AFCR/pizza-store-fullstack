import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{t('admin_dashboard.title')}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/users"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">{t('admin_dashboard.manage_users')}</h3>
          <p className="mt-2">{t('admin_dashboard.manage_users_desc', 'View, edit, or delete user accounts.')}</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">{t('admin_dashboard.manage_orders')}</h3>
          <p className="mt-2">{t('admin_dashboard.manage_orders_desc', 'View and update order statuses.')}</p>
        </Link>
        <Link
          to="/orders/new"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">{t('admin_dashboard.create_order', 'Create Order for Client')}</h3>
          <p className="mt-2">{t('admin_dashboard.create_order_desc', 'Place a new order for a client.')}</p>
        </Link>
        <Link
          to="/admin/products"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-center"
        >
          <h3 className="text-xl font-semibold">{t('admin_dashboard.manage_products')}</h3>
          <p className="mt-2">{t('admin_dashboard.manage_products_desc', 'Create, update, or delete menu items.')}</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;