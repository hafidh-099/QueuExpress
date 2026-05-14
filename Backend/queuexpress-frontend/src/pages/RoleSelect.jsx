import React from "react";
import { Link } from "react-router-dom";
import { FaUserShield, FaUsers, FaTicketAlt } from "react-icons/fa";
import Logo from "../components/Logo";

const RoleSelect = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-5xl w-full">
          {/* Header */}
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Logo type="full" size="lg" />
            </div>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Smart Queue Management System for Modern Businesses
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Admin Card */}
            <Link to="/admin-login" className="group">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
                  <div className="bg-white/20 rounded-full p-4 inline-block mb-4">
                    <FaUserShield className="text-white text-5xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Admin Access
                  </h2>
                  <p className="text-white/80 mt-2">System Administrator</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Full system
                      control
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Staff management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> Reports &
                      analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span> System
                      configuration
                    </li>
                  </ul>
                  <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-semibold group-hover:bg-opacity-90 transition-all">
                    Login as Admin →
                  </button>
                </div>
              </div>
            </Link>

            {/* Staff Card */}
            <Link to="/staff-login" className="group">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-secondary/80 p-6 text-center">
                  <div className="bg-white/20 rounded-full p-4 inline-block mb-4">
                    <FaUsers className="text-white text-5xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Staff Access
                  </h2>
                  <p className="text-white/80 mt-2">Service Personnel</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-secondary">✓</span> Queue management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-secondary">✓</span> Call customers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-secondary">✓</span> Serve customers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-secondary">✓</span> Skip management
                    </li>
                  </ul>
                  <button className="w-full mt-6 bg-secondary text-white py-3 rounded-lg font-semibold group-hover:bg-opacity-90 transition-all">
                    Login as Staff →
                  </button>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              © 2026 QueueXpress. Secure role-based access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
