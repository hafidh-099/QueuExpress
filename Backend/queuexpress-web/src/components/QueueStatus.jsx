import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaClock, FaLayerGroup } from 'react-icons/fa';
import { getQueueStatus } from '../api/queue';

const QueueStatus = ({ queueId, queueNumber, onFeedbackClick, onStatusChange }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServed, setIsServed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getQueueStatus(queueId);
        setStatus(data);
        
        if (data.status === 'served' && !isServed) {
          setIsServed(true);
          if (onFeedbackClick) {
            setTimeout(() => {
              onFeedbackClick();
            }, 1000);
          }
        }
        
        if (onStatusChange) {
          onStatusChange(data.status);
        }
        
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [queueId, isServed]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-yellow-500 bg-yellow-500/10';
      case 'called': return 'text-blue-500 bg-blue-500/10';
      case 'served': return 'text-green-500 bg-green-500/10';
      case 'skipped': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return t('status.waiting');
      case 'called': return t('status.called');
      case 'served': return t('status.served');
      case 'skipped': return t('status.skipped');
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0099CC]"></div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {error || 'Unable to fetch queue status'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Queue Card */}
      <div className={`rounded-2xl p-6 border-2 ${getStatusColor(status.status)} bg-white dark:bg-gray-900 shadow-lg transition-colors duration-300`}>
        {/* Status Badge */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Queue Info</span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(status.status)}`}>
            {getStatusText(status.status)}
          </span>
        </div>

        {/* Queue Number */}
        <div className="text-center py-4">
          <span className="text-7xl font-extrabold text-[#0099CC] dark:text-[#0099CC]">
            #{status.queue_number}
          </span>
        </div>

        {/* People Ahead */}
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <FaUsers className="text-[#F59E0B]" />
          <span className="font-medium">
            {status.people_ahead} {t('status.peopleAhead')}
          </span>
          {status.people_ahead === 0 && status.status === 'waiting' && (
            <span className="text-sm text-green-500 font-medium ml-2">
              {t('status.youAreNext')}
            </span>
          )}
          {status.people_ahead > 0 && (
            <span className="text-sm text-gray-400 ml-2">
              ({status.people_ahead} {t('status.peopleBeforeYou')})
            </span>
          )}
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-200 dark:border-gray-800" />

        {/* Bottom Row */}
        <div className="flex justify-around">
          <div className="text-center">
            <FaClock className="text-[#0099CC] text-xl mx-auto mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              {t('status.estimatedTime')}
            </span>
            <span className="text-lg font-bold text-[#0099CC]">
              {status.estimated_time} {t('status.minutes')}
            </span>
          </div>
          <div className="text-center">
            <FaLayerGroup className="text-[#0099CC] text-xl mx-auto mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              {t('status.batchNumber')}
            </span>
            <span className="text-lg font-bold text-[#0099CC]">
              {status.batch_number || '-'}
            </span>
          </div>
        </div>

        {/* Served Notification - Simplified */}
        {status.status === 'served' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
            <p className="text-green-600 dark:text-green-400 font-medium text-sm">
              ✅ {t('status.serviceCompletedMessage')}
            </p>
          </div>
        )}
      </div>

      {/* Skipped Message */}
      {status.status === 'skipped' && (
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          {t('status.skippedMessage')}
        </div>
      )}
    </div>
  );
};

export default QueueStatus;