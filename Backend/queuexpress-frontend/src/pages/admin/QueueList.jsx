import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaSpinner, FaSearch, FaFilter, FaClock, FaUserCheck, FaBan, FaPhone, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../api/axios';

const QueueList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all queues from admin endpoint
  const { data: queueData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-all-queues'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/all-queues/');
        console.log('Queue data received:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching queues:', err);
        throw err;
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Filter queues based on search and status
  const filteredQueues = React.useMemo(() => {
    if (!queueData?.queues) return [];
    
    return queueData.queues.filter(queue => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        queue.queue_number?.toString().includes(searchTerm) ||
        queue.phone_number?.includes(searchTerm) ||
        queue.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
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

  const stats = {
    waiting: queueData?.queues?.filter(q => q.status === 'waiting').length || 0,
    called: queueData?.queues?.filter(q => q.status === 'called').length || 0,
    served: queueData?.queues?.filter(q => q.status === 'served').length || 0,
    skipped: queueData?.queues?.filter(q => q.status === 'skipped').length || 0,
    total: queueData?.queues?.length || 0,
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
        <p className="text-red-600 mb-4">{error.message}</p>
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
        <p className="text-gray-500 mt-1">View all queue history and current status</p>
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
          {/* Search */}
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

          {/* Status Filter */}
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

          {/* Results Count */}
          <div className="ml-auto flex items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredQueues.length} of {stats.total} queues
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Queue #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Batch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueues.map((queue) => (
                  <tr key={queue.queue_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-primary">#{queue.queue_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-600">{queue.phone_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dark">{queue.service_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{queue.batch_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(queue.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(queue.status)}`}>
                          {queue.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-500">
                          {new Date(queue.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
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

export default QueueList;