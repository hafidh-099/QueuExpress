import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaSpinner, FaSave, FaClock, FaUsers, FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../../api/axios';

const Settings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    batch_size: 10,
    reset_time: '00:00:00',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/');
      return response.data;
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/admin/settings/', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Settings updated successfully!');
      queryClient.invalidateQueries(['system-settings']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update settings');
      setTimeout(() => setError(''), 3000);
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        batch_size: settings.batch_size || 10,
        reset_time: settings.reset_time || '00:00:00',
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-dark">System Settings</h2>
        <p className="text-gray-500 mt-1">Configure queue system parameters</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
          <FaCheckCircle />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-dark">Queue Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Configure how your queue system operates</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Batch Size Setting */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-primary" />
                    Batch Size
                  </div>
                </label>
                <input
                  type="number"
                  name="batch_size"
                  value={formData.batch_size}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of customers per batch. Each batch triggers a new group of queue numbers.
                </p>
              </div>

              {/* Reset Time Setting */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary" />
                    Daily Reset Time
                  </div>
                </label>
                <input
                  type="time"
                  name="reset_time"
                  value={formData.reset_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Queue numbers reset at this time every day. Queue starts from 1 after reset.
                </p>
              </div>

              {/* Current Values Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Current Configuration</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• Batch Size: <strong>{formData.batch_size}</strong> customers per batch</p>
                  <p>• Reset Time: <strong>{formData.reset_time}</strong> daily</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaSyncAlt className="text-primary text-xl" />
              <h3 className="font-semibold text-dark">How It Works</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong className="text-dark">Batch Size:</strong> Controls how many customers are grouped together. 
                Example: Batch size 10 means customers 1-10 are in batch 1, 11-20 in batch 2, etc.
              </p>
              <p>
                <strong className="text-dark">Reset Time:</strong> When the queue counter resets to 0. 
                New day starts fresh with queue number 1.
              </p>
            </div>
          </div>

          {/* Note Card */}
          <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Note</h3>
            <p className="text-sm text-yellow-700">
              Changes take effect immediately. Existing queues will use the new batch size for future calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;