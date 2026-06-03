import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaUsers, 
  FaClock, 
  FaBan, 
  FaUserCheck, 
  FaSpinner, 
  FaHourglassHalf
} from 'react-icons/fa';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_served: 0,
      total_waiting: 0,
      total_skipped: 0,
      total_staff: 0,
      avg_response_time_minutes: 0,
    },
    recent_queues: []
  });

  // Fetch dashboard stats from admin endpoint
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard-stats/');
      console.log('Dashboard stats:', response.data);
      return response.data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (adminStats) {
      setDashboardData(prev => ({
        ...prev,
        stats: adminStats.stats || prev.stats,
        recent_queues: adminStats.recent_queues || []
      }));
    }
  }, [adminStats]);

  const statCards = [
    {
      title: 'Total Served',
      value: dashboardData.stats.total_served,
      icon: <FaUserCheck />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      loading: statsLoading
    },
    {
      title: 'Waiting Customers',
      value: dashboardData.stats.total_waiting,
      icon: <FaClock />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      loading: statsLoading
    },
    {
      title: 'Skipped Customers',
      value: dashboardData.stats.total_skipped,
      icon: <FaBan />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      loading: statsLoading
    },
    {
      title: 'Total Staff',
      value: dashboardData.stats.total_staff,
      icon: <FaUsers />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      loading: statsLoading
    },
    {
      title: 'Avg Response Time',
      value: dashboardData.stats.avg_response_time_minutes || 0,
      unit: 'min',
      icon: <FaHourglassHalf />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      loading: statsLoading
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      waiting: 'bg-yellow-100 text-yellow-600',
      called: 'bg-blue-100 text-blue-600',
      served: 'bg-green-100 text-green-600',
      skipped: 'bg-red-100 text-red-600',
    };
    return badges[status] || 'bg-gray-100 text-gray-600';
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return null;
    try {
      const date = new Date(datetime);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
      };
    } catch (e) {
      return null;
    }
  };

  const calculateResponseTime = (queue) => {
    if (queue.called_at && queue.served_at) {
      try {
        const called = new Date(queue.called_at);
        const served = new Date(queue.served_at);
        const minutes = (served - called) / (1000 * 60);
        return minutes.toFixed(1);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  if (statsLoading && !adminStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-white/90">Here's what's happening with your queue system today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <div className={`text-2xl ${stat.textColor}`}>{stat.icon}</div>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            {stat.loading ? (
              <div className="flex items-center gap-2 mt-1">
                <FaSpinner className="animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-dark mt-1">
                {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Queue Activity with Timestamps */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark">Recent Queue Activity</h3>
          <button 
            onClick={() => window.location.href = '/admin/queue-list'}
            className="text-primary text-sm hover:underline"
          >
            View All →
          </button>
        </div>
        
        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-primary text-2xl" />
          </div>
        ) : dashboardData.recent_queues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No queue activity at the moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Queue #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Called</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Served</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Response</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_queues.map((queue) => {
                  const joinedTime = formatDateTime(queue.created_at);
                  const calledTime = formatDateTime(queue.called_at);
                  const servedTime = formatDateTime(queue.served_at);
                  const responseTime = calculateResponseTime(queue);
                  
                  return (
                    <tr key={queue.queue_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-dark">{queue.queue_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{queue.phone_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{queue.service_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(queue.status)}`}>
                          {queue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {joinedTime ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-600">{joinedTime.time}</span>
                            <span className="text-xs text-gray-400">{joinedTime.date}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {calledTime ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-600">{calledTime.time}</span>
                            <span className="text-xs text-gray-400">{calledTime.date}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {servedTime ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-600">{servedTime.time}</span>
                            <span className="text-xs text-gray-400">{servedTime.date}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {responseTime ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                            <FaHourglassHalf size={10} />
                            {responseTime} min
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto-refresh Note */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          Data auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;