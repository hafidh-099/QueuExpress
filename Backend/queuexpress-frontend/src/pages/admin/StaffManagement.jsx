import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaUserPlus, FaIdCard, FaUser, FaLock, FaTimes, FaCamera, FaImage } from 'react-icons/fa';
import api from '../../api/axios';

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    work_id: '',
    password: '',
    confirm_password: '',
    profile_image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch staff list
  const { data: staffList, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const response = await api.get('/admin/staff/');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('username', data.username);
      formDataToSend.append('full_name', data.full_name);
      formDataToSend.append('work_id', data.work_id);
      formDataToSend.append('password', data.password);
      if (data.profile_image) {
        formDataToSend.append('profile_image', data.profile_image);
      }
      
      const response = await api.post('/admin/staff/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Staff member created successfully!');
      resetForm();
      queryClient.invalidateQueries(['admin-staff']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to create staff');
      setTimeout(() => setError(''), 3000);
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      if (data.full_name) formDataToSend.append('full_name', data.full_name);
      if (data.work_id) formDataToSend.append('work_id', data.work_id);
      if (data.password) formDataToSend.append('password', data.password);
      if (data.profile_image) formDataToSend.append('profile_image', data.profile_image);
      
      const response = await api.put(`/admin/staff/${id}/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Staff member updated successfully!');
      resetForm();
      queryClient.invalidateQueries(['admin-staff']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update staff');
      setTimeout(() => setError(''), 3000);
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId) => {
      const response = await api.delete(`/admin/staff/${staffId}/`);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Staff member deleted successfully!');
      queryClient.invalidateQueries(['admin-staff']);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to delete staff');
      setTimeout(() => setError(''), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingStaff) {
      // Update existing staff
      const updateData = {
        full_name: formData.full_name,
        work_id: formData.work_id,
      };
      
      if (formData.password) {
        if (formData.password !== formData.confirm_password) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        updateData.password = formData.password;
      }
      
      if (formData.profile_image) {
        updateData.profile_image = formData.profile_image;
      }
      
      updateStaffMutation.mutate({ id: editingStaff.id, data: updateData });
    } else {
      // Create new staff
      if (!formData.username) {
        setError('Username is required');
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      createStaffMutation.mutate(formData);
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      username: staff.username,
      full_name: staff.full_name || '',
      work_id: staff.work_id || '',
      password: '',
      confirm_password: '',
      profile_image: null,
    });
    setPreviewImage(null);
    setShowModal(true);
  };

  const handleDelete = (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      deleteStaffMutation.mutate(staffId);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      full_name: '',
      work_id: '',
      password: '',
      confirm_password: '',
      profile_image: null,
    });
    setPreviewImage(null);
    setEditingStaff(null);
    setShowModal(false);
    setError('');
  };

  const getProfileImageUrl = (staff) => {
    if (staff.profile_image_url) {
      return staff.profile_image_url;
    }
    if (staff.profile_image) {
      if (staff.profile_image.startsWith('http')) {
        return staff.profile_image;
      }
      return `http://localhost:8000${staff.profile_image}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Staff Management</h2>
          <p className="text-gray-500 mt-1">Manage your service staff members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <FaPlus /> Add New Staff
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

      {/* Staff Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList?.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-secondary/80 p-4 text-white">
                <div className="flex items-center gap-3">
                  {getProfileImageUrl(staff) ? (
                    <img
                      src={getProfileImageUrl(staff)}
                      alt={staff.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-12 h-12 bg-white/20 rounded-full flex items-center justify-center';
                          fallback.innerHTML = `<span class="text-xl font-bold">${(staff.full_name?.charAt(0) || staff.username?.charAt(0)).toUpperCase()}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {(staff.full_name?.charAt(0) || staff.username?.charAt(0)).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{staff.full_name || staff.username}</h3>
                    <p className="text-sm text-white/80">@{staff.username}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FaIdCard className="text-gray-400" />
                  <span className="text-gray-600">Work ID:</span>
                  <span className="font-medium text-dark">{staff.work_id}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <FaUser className="text-gray-400" />
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(staff)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id, staff.full_name || staff.username)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {staffList?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl">
              <FaUserPlus className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">No staff members yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-primary hover:underline"
              >
                Add your first staff member →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl my-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-dark">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingStaff ? 'Update staff information' : 'Enter staff details below'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      />
                    ) : editingStaff?.profile_image_url ? (
                      <img
                        src={editingStaff.profile_image_url}
                        alt="Current"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                      />
                    ) : editingStaff?.profile_image ? (
                      <img
                        src={`http://localhost:8000${editingStaff.profile_image}`}
                        alt="Current"
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaImage className="text-gray-400 text-2xl" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <FaCamera />
                        <span className="text-sm">Upload Photo</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Recommended: Square image, max 2MB</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                {!editingStaff && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      placeholder="Enter username"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work ID *
                  </label>
                  <input
                    type="text"
                    value={formData.work_id}
                    onChange={(e) => setFormData({ ...formData, work_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="e.g., STF001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {editingStaff ? 'New Password (optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    {...(!editingStaff && { required: true })}
                    minLength="6"
                    placeholder={editingStaff ? 'Leave blank to keep current' : 'Enter password'}
                  />
                  {editingStaff && (
                    <p className="text-xs text-gray-400 mt-1">Leave blank to keep current password</p>
                  )}
                </div>
                
                {(formData.password || !editingStaff) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required={!!formData.password || !editingStaff}
                      placeholder="Confirm password"
                    />
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {createStaffMutation.isPending || updateStaffMutation.isPending
                      ? 'Saving...'
                      : editingStaff
                      ? 'Update Staff'
                      : 'Create Staff'}
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

export default StaffManagement;