import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSpinner, 
  FaStar, 
  FaSearch, 
  FaCalendarAlt,
  FaRegComment,
  FaFilter,
} from 'react-icons/fa';
import api from '../../api/axios';

const Feedback = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Fetch all feedback
  const { data: feedbackData, isLoading, error } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const response = await api.get('/admin/feedback/');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Filter feedback based on search and rating
  const filteredFeedback = React.useMemo(() => {
    if (!feedbackData) return [];
    
    return feedbackData.filter(feedback => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        feedback.phone_number?.includes(searchTerm) ||
        feedback.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.queue_id?.toString().includes(searchTerm);
      
      // Rating filter
      const matchesRating = ratingFilter === 'all' || 
        feedback.rating === parseInt(ratingFilter);
      
      return matchesSearch && matchesRating;
    });
  }, [feedbackData, searchTerm, ratingFilter]);

  // Calculate statistics
  const stats = {
    total: feedbackData?.length || 0,
    averageRating: feedbackData?.length > 0 
      ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
      : 0,
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        Failed to load feedback data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Customer Feedback</h2>
          <p className="text-gray-500 mt-1">View and analyze customer reviews</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FaRegComment className="text-primary text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Feedback</h3>
          </div>
          <p className="text-3xl font-bold text-dark">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-2">Customer reviews received</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FaStar className="text-yellow-500 text-xl" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-dark">{stats.averageRating}</p>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-lg ${i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">out of 5.0 stars</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by phone, queue number, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="ml-auto flex items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredFeedback.length} of {stats.total} results
            </span>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaRegComment className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No feedback found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredFeedback.map((feedback) => (
            <div key={feedback.feedback_id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getRatingStars(feedback.rating)}
                      <span className="text-sm font-semibold text-dark ml-1">{feedback.rating}/5</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    "{feedback.message || 'No message provided'}"
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>Queue #{feedback.queue_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      <span>{new Date(feedback.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 mb-1">Customer</span>
                  <span className="font-mono text-sm text-dark">{feedback.phone_number}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feedback;