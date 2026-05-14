import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaUsers, 
  FaServicestack, 
  FaChartBar, 
  FaComments, 
  FaQrcode, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/profile', name: 'Profile', icon: <FaUser /> },
    { path: '/admin/staff', name: 'Staff Management', icon: <FaUsers /> },
    { path: '/admin/services', name: 'Services', icon: <FaServicestack /> },
    { path: '/admin/reports', name: 'Reports', icon: <FaChartBar /> },
    { path: '/admin/feedback', name: 'Feedback', icon: <FaComments /> },
    { path: '/admin/qr-management', name: 'QR Management', icon: <FaQrcode /> },
    { path: '/admin/settings', name: 'Settings', icon: <FaCog /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-primary text-white p-2 rounded-lg shadow-lg"
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-dark text-white z-40
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className={`p-6 border-b border-gray-700 ${!sidebarOpen && 'lg:px-3'}`}>
          <div className={`flex items-center ${!sidebarOpen && 'lg:justify-center'}`}>
            <div className="cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? (
                <Logo type="full" size="sm" />
              ) : (
                <Logo type="icon" size="sm" />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 transition-all duration-200
                ${sidebarOpen ? 'justify-start' : 'lg:justify-center'}
                ${isActive(item.path) 
                  ? 'bg-primary/20 border-r-4 border-primary text-primary' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Top Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex justify-between items-center">
            {/* Page Title */}
            <h1 className="text-xl font-semibold text-dark">
              {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
            </h1>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-dark">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
                      <p className="font-semibold text-dark">{user?.full_name || user?.username}</p>
                      <p className="text-sm text-gray-500">{user?.username}</p>
                      <p className="text-xs text-primary capitalize mt-1">{user?.role}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/admin/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FaUser className="text-gray-400" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;