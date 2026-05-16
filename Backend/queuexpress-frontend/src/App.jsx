import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleSelect from "./pages/RoleSelect";
import AdminLogin from "./pages/AdminLogin";
import StaffLogin from "./pages/StaffLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import StaffManagement from "./pages/admin/StaffManagement";
import Services from "./pages/admin/Services";
import Reports from "./pages/admin/Reports";
import Feedback from "./pages/admin/Feedback";
import QRManagement from "./pages/admin/QRManagement";
import Join from "./pages/Join";
import Settings from "./pages/admin/Settings";
import Logout from "./pages/Logout";
import QueueList from "./pages/admin/QueueList";
import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffProfile from "./pages/staff/Profile";
import StaffQueueList from "./pages/staff/QueueList";
import QueueControl from "./pages/staff/QueueControl";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/logout" element={<Logout />} />
            <Route path="/join" element={<Join />} />
            <Route path="/" element={<StaffLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="queue-list" element={<QueueList />} />
              <Route path="settings" element={<Settings />} />
              <Route path="qr-management" element={<QRManagement />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="reports" element={<Reports />} />
              <Route path="services" element={<Services />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              {/* Other admin routes will go here */}
            </Route>
            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["staff"]}>
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="queue-list" element={<StaffQueueList />} />
              <Route path="queue-control" element={<QueueControl />} />
              <Route path="profile" element={<StaffProfile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
