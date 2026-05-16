import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaSpinner, FaUsers, FaPhoneAlt, FaUserCheck, FaClock, FaChartLine } from 'react-icons/fa';
import api from '../../api/axios';

const StaffDashboard = () => {
  // Fetch queue stats
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['staff-queue-list'],
    queryFn: async () => {
      const response = await api.get('/staff/queue-list/');
      return response.data;
    },
    refetchInterval: 5000,
  });

  const stats = {
    waiting: queueData?.queues?.filter(q => q.status === 'waiting').length || 0,
    called: queueData?.queues?.filter(q => q.status === 'called').length || 0,
    total: queueData?.queues?.length || 0,
  };

  // Get current batch (first waiting queue's batch)
  const currentBatch = queueData?.queues?.[0]?.batch_number || '-';
  const currentQueue = queueData?.queues?.[0]?.queue_number || '-';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, Staff!</h2>
        <p className="text-white/90">Manage queue operations and serve customers efficiently.</p>
      </div>

      {/* Current Queue Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-2xl" />
            <h3 className="text-sm font-medium opacity-90">Current Queue</h3>
          </div>
          <p className="text-4xl font-bold">{currentQueue}</p>
          <p className="text-sm opacity-80 mt-1">Next customer to call</p>
        </div>
        
        <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-2xl" />
            <h3 className="text-sm font-medium opacity-90">Current Batch</h3>
          </div>
          <p className="text-4xl font-bold">{currentBatch}</p>
          <p className="text-sm opacity-80 mt-1">Active batch number</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Waiting</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.waiting}</p>
          <p className="text-xs text-gray-400 mt-2">Customers waiting to be called</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaPhoneAlt className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Called</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.called}</p>
          <p className="text-xs text-gray-400 mt-2">Called to counter</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FaUserCheck className="text-primary text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Active</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-2">Currently in system</p>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          💡 <strong>Quick Tip:</strong> Use the <strong>Queue Control</strong> page to call next customer, 
          mark as served, or skip customers.
        </p>
      </div>
    </div>
  );
};

export default StaffDashboard;