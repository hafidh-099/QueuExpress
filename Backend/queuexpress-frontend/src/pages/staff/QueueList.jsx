import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaSpinner, FaSearch, FaFilter, FaClock, FaUserCheck, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import api from '../../api/axios';

const StaffQueueList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: queueData, isLoading } = useQuery({
    queryKey: ['staff-queue-list'],
    queryFn: async () => {
      const response = await api.get('/staff/queue-list/');
      return response.data;
    },
    refetchInterval: 5000,
  });

  const filteredQueues = React.useMemo(() => {
    if (!queueData?.queues) return [];
    
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
    };
    return badges[status] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-secondary text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-dark">Active Queues</h2>
        <p className="text-gray-500 mt-1">View waiting and called customers</p>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="called">Called</option>
            </select>
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
            <p className="text-gray-400">No active queues</p>
            <p className="text-sm text-gray-400 mt-1">Waiting and called queues will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Queue #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Batch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueues.map((queue) => (
                  <tr key={queue.queue_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-secondary">#{queue.queue_number}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{queue.phone_number}</td>
                    <td className="px-6 py-4 text-sm text-dark">{queue.service_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{queue.batch_number}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(queue.status)}`}>
                        {queue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(queue.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffQueueList;