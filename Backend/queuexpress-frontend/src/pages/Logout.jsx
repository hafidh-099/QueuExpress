import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    // Small delay to show loading state
    const timer = setTimeout(() => {
      logout();
    }, 500);

    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;