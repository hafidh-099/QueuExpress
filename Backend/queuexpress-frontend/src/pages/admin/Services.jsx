import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaTimes,
  FaClipboardList
} from 'react-icons/fa';
import api from '../../api/axios';

const Services = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch services
  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const response = await api.get('/admin/services/');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (name) => {
      const response = await api.post('/admin/services/', { service_name: name });
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Service created successfully!');
      resetModal();
      queryClient.invalidateQueries(['admin-services']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to create service');
      setTimeout(() => setError(''), 3000);
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const response = await api.put(`/admin/services/${id}/`, { service_name: name });
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Service updated successfully!');
      resetModal();
      queryClient.invalidateQueries(['admin-services']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update service');
      setTimeout(() => setError(''), 3000);
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/admin/services/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Service deleted successfully!');
      queryClient.invalidateQueries(['admin-services']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to delete service');
      setTimeout(() => setError(''), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setError('Service name is required');
      return;
    }
    
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.service_id, name: serviceName });
    } else {
      createServiceMutation.mutate(serviceName);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceName(service.service_name);
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteServiceMutation.mutate(id);
    }
  };

  const resetModal = () => {
    setServiceName('');
    setEditingService(null);
    setShowModal(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Services Management</h2>
          <p className="text-gray-500 mt-1">Manage queue service types that customers can select</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <FaPlus /> Add Service
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Stats Summary */}
      {services && services.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4">
          <p className="text-dark">
            Total Services: <span className="font-bold text-primary">{services.length}</span>
          </p>
        </div>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <div key={service.service_id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="text-white text-xl" />
                  </div>
                  <h3 className="font-semibold text-lg flex-1 truncate">{service.service_name}</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Service ID: <span className="font-mono text-primary">{service.service_id}</span>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.service_id, service.service_name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {services?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl">
              <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No services available</p>
              <p className="text-sm text-gray-400 mt-1">Add your first service to get started</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-primary hover:underline"
              >
                Add your first service →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-dark">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingService ? 'Update service name' : 'Enter service details below'}
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g., General Inquiry, Bill Payment, Document Processing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    This service will appear in the customer join queue form
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {createServiceMutation.isPending || updateServiceMutation.isPending
                      ? 'Saving...'
                      : editingService
                      ? 'Update Service'
                      : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Services;