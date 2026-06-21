import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaStar, FaSpinner } from 'react-icons/fa';
import { submitFeedback } from '../api/queue';

const FeedbackForm = ({ queueId, onSuccess }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitFeedback(queueId, rating, message);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || t('feedback.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-6">
        {t('feedback.title')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating Stars */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('feedback.rating')} <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-4xl transition-all transform hover:scale-110"
              >
                <FaStar
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {error && error.includes('rating') && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('feedback.message')}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('feedback.messagePlaceholder')}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all resize-none"
          />
        </div>

        {error && !error.includes('rating') && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#0099CC] to-[#00B140] text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              {t('feedback.submitting')}
            </>
          ) : (
            t('feedback.submitButton')
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;