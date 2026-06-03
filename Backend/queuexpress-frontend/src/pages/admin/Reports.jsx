import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSpinner, 
  FaFileExcel, 
  FaUsers,
  FaClock,
  FaBan,
  FaUserCheck,
  FaStar,
  FaChartLine,
  FaPercentage,
  FaHourglassHalf
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import api from '../../api/axios';

const Reports = () => {
  const [exporting, setExporting] = React.useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-report'],
    queryFn: async () => {
      const response = await api.get('/admin/report/');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch dashboard stats with response time
  const { data: dashboardStatsData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard-stats/');
      setDashboardStats(response.data.stats);
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch all feedback for report
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const response = await api.get('/admin/feedback/');
      return response.data;
    },
  });

  // Fetch all staff for report
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const response = await api.get('/admin/staff/');
      return response.data;
    },
  });

  // Fetch all services for report
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const response = await api.get('/admin/services/');
      return response.data;
    },
  });

  const isLoading = statsLoading || feedbackLoading || staffLoading || servicesLoading || dashboardLoading;

  // Calculate analytics
  const totalCustomers = (statsData?.total_served || 0) + (statsData?.total_waiting || 0) + (statsData?.total_skipped || 0);
  const completionRate = totalCustomers > 0 
    ? ((statsData?.total_served || 0) / totalCustomers * 100).toFixed(1)
    : 0;
  
  const averageRating = feedbackData && feedbackData.length > 0
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : 0;
  
  const avgResponseTime = dashboardStats?.avg_response_time_minutes || 0;
  
  const ratingDistribution = {
    5: feedbackData?.filter(f => f.rating === 5).length || 0,
    4: feedbackData?.filter(f => f.rating === 4).length || 0,
    3: feedbackData?.filter(f => f.rating === 3).length || 0,
    2: feedbackData?.filter(f => f.rating === 2).length || 0,
    1: feedbackData?.filter(f => f.rating === 1).length || 0,
  };

  // Export to Excel
  const exportToExcel = () => {
    setExporting(true);
    
    const analyticsData = [
      { Metric: 'Total Served Customers', Value: statsData?.total_served || 0 },
      { Metric: 'Waiting Customers', Value: statsData?.total_waiting || 0 },
      { Metric: 'Skipped Customers', Value: statsData?.total_skipped || 0 },
      { Metric: 'Total Customers', Value: totalCustomers },
      { Metric: 'Service Completion Rate', Value: `${completionRate}%` },
      { Metric: 'Average Customer Rating', Value: `${averageRating} / 5.0` },
      { Metric: 'Average Response Time', Value: `${avgResponseTime} minutes` },
      { Metric: 'Total Staff Members', Value: staffData?.length || 0 },
      { Metric: 'Total Services Offered', Value: servicesData?.length || 0 },
      { Metric: 'Total Feedback Received', Value: feedbackData?.length || 0 },
      { Metric: 'Report Generated', Value: new Date().toLocaleString() },
    ];
    
    const ratingDistributionData = [
      { Rating: '5 Stars', Count: ratingDistribution[5], Percentage: feedbackData?.length ? ((ratingDistribution[5] / feedbackData.length) * 100).toFixed(1) : 0 },
      { Rating: '4 Stars', Count: ratingDistribution[4], Percentage: feedbackData?.length ? ((ratingDistribution[4] / feedbackData.length) * 100).toFixed(1) : 0 },
      { Rating: '3 Stars', Count: ratingDistribution[3], Percentage: feedbackData?.length ? ((ratingDistribution[3] / feedbackData.length) * 100).toFixed(1) : 0 },
      { Rating: '2 Stars', Count: ratingDistribution[2], Percentage: feedbackData?.length ? ((ratingDistribution[2] / feedbackData.length) * 100).toFixed(1) : 0 },
      { Rating: '1 Star', Count: ratingDistribution[1], Percentage: feedbackData?.length ? ((ratingDistribution[1] / feedbackData.length) * 100).toFixed(1) : 0 },
    ];
    
    const staffSheetData = staffData?.map(staff => ({
      'Full Name': staff.full_name || staff.username,
      'Work ID': staff.work_id,
      'Username': staff.username,
      'Status': 'Active',
    })) || [];
    
    const servicesSheetData = servicesData?.map(service => ({
      'Service ID': service.service_id,
      'Service Name': service.service_name,
    })) || [];
    
    const wb = XLSX.utils.book_new();
    
    const analyticsWs = XLSX.utils.json_to_sheet(analyticsData);
    const ratingWs = XLSX.utils.json_to_sheet(ratingDistributionData);
    const staffWs = XLSX.utils.json_to_sheet(staffSheetData);
    const servicesWs = XLSX.utils.json_to_sheet(servicesSheetData);
    
    XLSX.utils.book_append_sheet(wb, analyticsWs, 'Analytics Summary');
    XLSX.utils.book_append_sheet(wb, ratingWs, 'Rating Distribution');
    XLSX.utils.book_append_sheet(wb, staffWs, 'Staff Members');
    XLSX.utils.book_append_sheet(wb, servicesWs, 'Services');
    
    XLSX.writeFile(wb, `queuexpress_analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Analytics & Insights</h2>
          <p className="text-gray-500 mt-1">Key performance metrics and customer satisfaction data</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={exporting || isLoading}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
        >
          <FaFileExcel /> {exporting ? 'Exporting...' : 'Export Analytics'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : (
        <>
          {/* Key Metrics Cards - Including Avg Response Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <FaUserCheck className="text-2xl text-green-600" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Total Served</h3>
              <p className="text-3xl font-bold text-dark mt-1">{statsData?.total_served || 0}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <FaClock className="text-2xl text-yellow-600" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Currently Waiting</h3>
              <p className="text-3xl font-bold text-dark mt-1">{statsData?.total_waiting || 0}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-xl">
                  <FaBan className="text-2xl text-red-600" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Skipped</h3>
              <p className="text-3xl font-bold text-dark mt-1">{statsData?.total_skipped || 0}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FaPercentage className="text-2xl text-blue-600" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
              <p className="text-3xl font-bold text-dark mt-1">{completionRate}%</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <FaHourglassHalf className="text-2xl text-purple-600" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Avg Response Time</h3>
              <p className="text-3xl font-bold text-dark mt-1">{avgResponseTime} <span className="text-lg">min</span></p>
            </div>
          </div>

          {/* Customer Satisfaction Card Only */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Satisfaction Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <FaStar className="text-yellow-500 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-dark">Customer Satisfaction</h3>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary">{averageRating}</div>
                <p className="text-gray-500 mt-1">Average Rating (out of 5.0)</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-2xl ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">Based on {feedbackData?.length || 0} customer reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution[rating];
                  const percentage = feedbackData?.length ? ((count / feedbackData.length) * 100).toFixed(0) : 0;
                  return (
                    <div key={rating}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{rating} Stars</span>
                        <span className="text-gray-500">{count} reviews ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Statistics Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FaChartLine className="text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-dark">Quick Statistics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-primary" />
                    <span className="text-gray-600">Total Staff</span>
                  </div>
                  <span className="font-semibold text-dark text-xl">{staffData?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <FaChartLine className="text-primary" />
                    <span className="text-gray-600">Total Services</span>
                  </div>
                  <span className="font-semibold text-dark text-xl">{servicesData?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <FaStar className="text-yellow-500" />
                    <span className="text-gray-600">Total Feedback</span>
                  </div>
                  <span className="font-semibold text-dark text-xl">{feedbackData?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <FaPercentage className="text-green-600" />
                    <span className="text-gray-600">Success Rate</span>
                  </div>
                  <span className="font-semibold text-green-600 text-xl">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;