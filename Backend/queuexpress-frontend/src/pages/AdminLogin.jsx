import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import Logo from "../components/Logo";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
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

    if (!formData.username || !formData.password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(
      {
        username: formData.username,
        password: formData.password,
      },
      "admin",
    );

    if (result.success && result.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      setError(result.error || "Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl w-full flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Admin Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-8 lg:p-12 flex flex-col justify-center items-center text-center">
            <Link
              to="/"
              className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors flex items-center gap-2"
            >
              <FaArrowLeft /> Back
            </Link>
            <div className="mb-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 inline-block">
                <FaUser className="text-white text-6xl" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Admin Portal</h2>

            <p className="text-white/90 text-sm">System Administrator Access</p>

            <div className="mt-8 pt-8 border-t border-white/20 w-full">
              <div className="space-y-2 text-white/70 text-xs">
                <p> Secure admin authentication required</p>
                <p> Use your privilage wisely</p>
                <p> Empower your team with smart tools</p>
              </div>
            </div>
          </div>

          {/* Right Side - Admin Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="mb-8 text-center lg:text-left">
              <Logo type="full" size="md" />
              <h3 className="text-2xl font-bold text-dark mt-6">
                Admin Sign In
              </h3>
              <p className="text-gray-500 mt-2">
                Enter your administrator credentials
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
                  Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your username"
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
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
