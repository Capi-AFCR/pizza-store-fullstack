import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios, { AxiosResponse } from 'axios';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  scheduledOrders: number;
  customPizzaOrders: number;
  statusCounts: { [key: string]: number };
  dailyOrders: { [key: string]: number };
  dailyScheduledOrders: { [key: string]: number };
  dailyCustomPizzaOrders: { [key: string]: number };
}

const OrderAnalyticsDashboard: React.FC<{ token: string }> = ({ token }) => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const params = startDate && endDate ? { startDate, endDate } : {};
        const response: AxiosResponse<OrderAnalytics> = await axios.get('/api/orders/analytics', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setAnalytics(response.data);
        setError('');
      } catch (err: any) {
        setError(t('analytics.error') + ' ' + (err.response?.data?.error || err.message));
      }
    };
    fetchAnalytics();
  }, [token, startDate, endDate, t]);

  const handleDateChange = () => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response: AxiosResponse<OrderAnalytics> = await axios.get('/api/orders/analytics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
      });
      setAnalytics(response.data);
      setError('');
    } catch (err: any) {
      setError(t('analytics.error') + ' ' + (err.response?.data?.error || err.message));
    }
  };

  const statusChartData = {
    labels: analytics ? Object.keys(analytics.statusCounts).map(status => t(`client_dashboard.status_${status.toLowerCase()}`)) : [],
    datasets: [{
      data: analytics ? Object.values(analytics.statusCounts) : [],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'],
      hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#4B5563']
    }]
  };

  const dailyOrdersChartData = {
    labels: analytics ? Object.keys(analytics.dailyOrders).sort() : [],
    datasets: [
      {
        label: t('analytics.daily_orders'),
        data: analytics ? Object.keys(analytics.dailyOrders).sort().map(date => analytics.dailyOrders[date]) : [],
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.1
      },
      {
        label: t('analytics.daily_scheduled_orders'),
        data: analytics ? Object.keys(analytics.dailyOrders).sort().map(date => analytics.dailyScheduledOrders[date] || 0) : [],
        fill: false,
        borderColor: '#10B981',
        tension: 0.1
      },
      {
        label: t('analytics.daily_custom_pizza_orders'),
        data: analytics ? Object.keys(analytics.dailyOrders).sort().map(date => analytics.dailyCustomPizzaOrders[date] || 0) : [],
        fill: false,
        borderColor: '#F59E0B',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-4xl font-semibold text-gray-800 mb-6 animate-fade-in">{t('analytics.title')}</h2>
      {error && <p className="text-red-500 mb-6 font-medium bg-red-50 p-4 rounded-lg animate-fade-in">{error}</p>}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('analytics.date_range')}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('analytics.date_range')}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleDateChange}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Apply
          </button>
        </div>
      </div>
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.total_orders')}</h3>
            <p className="text-3xl font-medium text-blue-600">{analytics.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.total_revenue')}</h3>
            <p className="text-3xl font-medium text-blue-600">${analytics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.avg_order_value')}</h3>
            <p className="text-3xl font-medium text-blue-600">${analytics.averageOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.scheduled_orders')}</h3>
            <p className="text-3xl font-medium text-blue-600">{analytics.scheduledOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.custom_pizza_orders')}</h3>
            <p className="text-3xl font-medium text-blue-600">{analytics.customPizzaOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.status_distribution')}</h3>
            <Pie data={statusChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('analytics.daily_orders')}</h3>
            <Line data={dailyOrdersChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-lg">{t('analytics.error')}</p>
      )}
    </div>
  );
};

export default OrderAnalyticsDashboard;