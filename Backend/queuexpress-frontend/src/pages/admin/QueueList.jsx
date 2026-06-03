import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSpinner, 
  FaSearch, 
  FaFilter, 
  FaClock, 
  FaUserCheck, 
  FaBan, 
  FaPhone, 
  FaExclamationTriangle,
  FaHourglassHalf
} from 'react-icons/fa';
import api from '../../api/axios';

const QueueList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all queues from admin endpoint
  const { data: queueData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-all-queues'],
    queryFn: async () => {
      const response = await api.get('/admin/all-queues/');
      console.log('API Response:', response.data); // Debug log
      return response.data;
    },
    refetchInterval: 10000,
  });

  const filteredQueues = useMemo(() => {
    if (!queueData?.queues || !Array.isArray(queueData.queues)) return [];
    
    return queueData.queues.filter(queue => {
      const matchesSearch = searchTerm === '' || 
        queue.queue_number?.toString().includes(searchTerm) ||
        queue.phone_number?.includes(searchTerm) ||
        queue.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || queue.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [queueData, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const badges = {
      waiting: 'bg-yellow-100 text-yellow-600',
      called: 'bg-blue-100 text-blue-600',
      served: 'bg-green-100 text-green-600',
      skipped: 'bg-red-100 text-red-600',
    };
    return badges[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      waiting: <FaClock className="text-yellow-500" />,
      called: <FaUserCheck className="text-blue-500" />,
      served: <FaUserCheck className="text-green-500" />,
      skipped: <FaBan className="text-red-500" />,
    };
    return icons[status] || <FaClock />;
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

  const stats = {
    waiting: queueData?.queues?.filter(q => q.status === 'waiting').length || 0,
    called: queueData?.queues?.filter(q => q.status === 'called').length || 0,
    served: queueData?.queues?.filter(q => q.status === 'served').length || 0,
    skipped: queueData?.queues?.filter(q => q.status === 'skipped').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to Load Data</h3>
        <p className="text-red-600 mb-4">{error.message || 'Please check your connection'}</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-dark">Queue Management</h2>
        <p className="text-gray-500 mt-1">View all queue history with complete timeline tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Waiting</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.waiting}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaUserCheck className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Called</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.called}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Served</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.served}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <FaBan className="text-red-600 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Skipped</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.skipped}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by queue number, phone, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="called">Called</option>
              <option value="served">Served</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          <div className="ml-auto flex items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredQueues.length} queues
            </span>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredQueues.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="text-gray-400 text-3xl" />
            </div>
            <p className="text-gray-400">No queues found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Joined At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Called At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Served At</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueues.map((queue) => {
                  const joinedTime = formatDateTime(queue.created_at);
                  const calledTime = formatDateTime(queue.called_at);
                  const servedTime = formatDateTime(queue.served_at);
                  const responseTime = calculateResponseTime(queue);
                  
                  return (
                    <tr key={queue.queue_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-lg font-bold text-primary">#{queue.queue_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-600">{queue.phone_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-dark">{queue.service_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(queue.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(queue.status)}`}>
                            {queue.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {joinedTime ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">{joinedTime.time}</span>
                            <span className="text-xs text-gray-400">{joinedTime.date}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {calledTime ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">{calledTime.time}</span>
                            <span className="text-xs text-gray-400">{calledTime.date}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {servedTime ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">{servedTime.time}</span>
                            <span className="text-xs text-gray-400">{servedTime.date}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
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

      <div className="text-center">
        <p className="text-xs text-gray-400">
          Data auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default QueueList;