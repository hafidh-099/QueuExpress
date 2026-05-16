import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaIdCard,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import Logo from "../components/Logo";

const StaffLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    work_id: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.work_id || !formData.password) {
      setError("Please enter Work ID and password");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(
      {
        work_id: formData.work_id,
        password: formData.password,
      },
      "staff",
    );

    if (result.success && result.role === "staff") {
      navigate("/staff/dashboard");
    } else if (result.success && result.role === "admin") {
      // If somehow admin tries to login as staff
      setError("Invalid staff credentials");
    } else {
      setError(result.error || "Invalid staff credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10">
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Staff Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-secondary to-secondary/80 p-8 lg:p-12 flex flex-col justify-center items-center text-center">
            <Link
              to="/"
              className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <FaArrowLeft /> Back
            </Link>
            <div className="mb-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 inline-block">
                <FaIdCard className="text-white text-6xl" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Staff Portal</h2>

            <p className="text-white/90 text-sm mb-6">
              "Service excellence starts here"
            </p>

            <div className="mt-8 pt-8 border-t border-white/20 w-full">
              <div className="space-y-3 text-white/80 text-sm">
                <div className="flex items-center justify-center gap-2"></div>
                <div className="flex items-center justify-center gap-2">
                  <span>Create memorable customer experiences</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>Manage queues with confidence</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>Build trust through efficiency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Staff Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="mb-8 text-center lg:text-left">
              <Logo className="mx-auto lg:mx-0" />
              <h3 className="text-2xl font-bold text-dark mt-6">
                Staff Sign In
              </h3>
              <p className="text-gray-500 mt-2">
                Enter your work ID and password
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Work ID
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" />
                  <input
                    type="text"
                    name="work_id"
                    value={formData.work_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                    placeholder="Enter your Work ID"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  "Login as Staff"
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Contact administrator if you don't have Work ID
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
