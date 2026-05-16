import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPhoneAlt, FaUserCheck, FaBan, FaSpinner, FaUsers, FaClock } from 'react-icons/fa';
import api from '../../api/axios';

const QueueControl = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch current queues
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['staff-queue-list'],
    queryFn: async () => {
      const response = await api.get('/staff/queue-list/');
      return response.data;
    },
    refetchInterval: 3000,
  });

  // Call next customer
  const callNextMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/staff/call-next/');
      return response.data;
    },
    onSuccess: (data) => {
      setMessage({ type: 'success', text: `Called Queue #${data.queue_number} - ${data.phone_number}` });
      queryClient.invalidateQueries(['staff-queue-list']);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to call next customer' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
  });

  // Serve customer
  const serveMutation = useMutation({
    mutationFn: async (queueId) => {
      const response = await api.post(`/staff/serve/${queueId}/`);
      return response.data;
    },
    onSuccess: (_, queueId) => {
      setMessage({ type: 'success', text: `Queue #${queueId} marked as served` });
      queryClient.invalidateQueries(['staff-queue-list']);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to serve customer' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
  });

  // Skip customer
  const skipMutation = useMutation({
    mutationFn: async (queueId) => {
      const response = await api.post(`/staff/skip/${queueId}/`);
      return response.data;
    },
    onSuccess: (_, queueId) => {
      setMessage({ type: 'warning', text: `Queue #${queueId} has been skipped` });
      queryClient.invalidateQueries(['staff-queue-list']);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to skip customer' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    },
  });

  const waitingQueues = queueData?.queues?.filter(q => q.status === 'waiting') || [];
  const calledQueues = queueData?.queues?.filter(q => q.status === 'called') || [];
  const nextQueue = waitingQueues[0];

  const handleCallNext = () => {
    if (nextQueue) {
      callNextMutation.mutate();
    }
  };

  const handleServe = (queueId) => {
    serveMutation.mutate(queueId);
  };

  const handleSkip = (queueId) => {
    if (window.confirm('Are you sure you want to skip this customer?')) {
      skipMutation.mutate(queueId);
    }
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-dark">Queue Control</h2>
        <p className="text-gray-500 mt-1">Manage customer queue operations</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
          'bg-yellow-50 text-yellow-600 border border-yellow-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-2xl" />
            <h3 className="text-sm font-medium opacity-90">Waiting</h3>
          </div>
          <p className="text-4xl font-bold">{waitingQueues.length}</p>
          <p className="text-sm opacity-80 mt-1">Customers in queue</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FaPhoneAlt className="text-2xl" />
            <h3 className="text-sm font-medium opacity-90">Called</h3>
          </div>
          <p className="text-4xl font-bold">{calledQueues.length}</p>
          <p className="text-sm opacity-80 mt-1">Called to counter</p>
        </div>
        
        <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-2xl" />
            <h3 className="text-sm font-medium opacity-90">Next Queue</h3>
          </div>
          <p className="text-4xl font-bold">{nextQueue?.queue_number || '-'}</p>
          <p className="text-sm opacity-80 mt-1">Next to call</p>
        </div>
      </div>

      {/* Call Next Button */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={handleCallNext}
          disabled={!nextQueue || callNextMutation.isPending}
          className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {callNextMutation.isPending ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaPhoneAlt />
          )}
          {callNextMutation.isPending ? 'Calling...' : 'Call Next Customer'}
        </button>
        {!nextQueue && waitingQueues.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-3">No customers waiting</p>
        )}
      </div>

      {/* Called Queues Table */}
      {calledQueues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <h3 className="font-semibold text-blue-800">Called Customers (Awaiting Service)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Queue #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calledQueues.map((queue) => (
                  <tr key={queue.queue_id} className="border-b border-gray-100">
                    <td className="px-6 py-4">
                      <span className="font-bold text-secondary text-lg">#{queue.queue_number}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{queue.phone_number}</td>
                    <td className="px-6 py-4 text-dark">{queue.service_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServe(queue.queue_id)}
                          disabled={serveMutation.isPending}
                          className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <FaUserCheck size={12} /> Serve
                        </button>
                        <button
                          onClick={() => handleSkip(queue.queue_id)}
                          disabled={skipMutation.isPending}
                          className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <FaBan size={12} /> Skip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Waiting Queues Preview */}
      {waitingQueues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
            <h3 className="font-semibold text-yellow-800">Waiting Queue (Next in Line)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Queue #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Batch</th>
                </tr>
              </thead>
              <tbody>
                {waitingQueues.slice(0, 5).map((queue) => (
                  <tr key={queue.queue_id} className="border-b border-gray-100">
                    <td className="px-6 py-4">
                      <span className="font-bold text-secondary text-lg">#{queue.queue_number}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{queue.phone_number}</td>
                    <td className="px-6 py-4 text-dark">{queue.service_name}</td>
                    <td className="px-6 py-4 text-gray-600">{queue.batch_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueControl;