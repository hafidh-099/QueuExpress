import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaIdCard, FaLock, FaSpinner, FaUser, FaEnvelope } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const AdminProfile = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch admin profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const response = await api.get('/admin/profile/');
      return response.data;
    },
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/admin/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const profile = profileData || user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-lg">
              <span className="text-5xl font-bold">
                {profile?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile?.username}</h2>
            <p className="text-white/90 flex items-center justify-center md:justify-start gap-2 mt-1">
              <FaIdCard /> System Administrator
            </p>
            <p className="text-white/70 text-sm mt-2">Full access to all system features</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Profile Information Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-dark">Profile Information</h3>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <FaLock /> Change Password
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-100">
              <div className="md:w-1/3">
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <FaUser className="text-primary" /> Username
                </label>
              </div>
              <div className="md:w-2/3">
                <p className="text-dark font-medium">{profile?.username}</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-100">
              <div className="md:w-1/3">
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <FaIdCard className="text-primary" /> Role
                </label>
              </div>
              <div className="md:w-2/3">
                <span className="inline-flex px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  Administrator
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center py-3">
              <div className="md:w-1/3">
                <label className="text-sm text-gray-500 flex items-center gap-2">
                  <FaEnvelope className="text-primary" /> Access Level
                </label>
              </div>
              <div className="md:w-2/3">
                <p className="text-dark">Full System Access</p>
                <p className="text-xs text-gray-400 mt-1">Manage staff, services, reports, and system settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-dark">Change Password</h3>
                <p className="text-sm text-gray-500 mt-1">Enter your current password and new password</p>
              </div>
              
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                    minLength="6"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
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

export default AdminProfile;