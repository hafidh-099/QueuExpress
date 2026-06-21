import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSpinner } from 'react-icons/fa';
import { getServices, joinQueue } from '../api/queue';

const JoinForm = ({ onJoinSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedService) {
      newErrors.service = t('join.validation.serviceRequired');
    }
    if (!phoneNumber) {
      newErrors.phone = t('join.validation.phoneRequired');
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phone = t('join.validation.phoneInvalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullPhoneNumber = `255${phoneNumber}`;
      const result = await joinQueue(fullPhoneNumber, selectedService);
      onJoinSuccess(result);
    } catch (error) {
      console.error('Join error:', error);
      setErrors({ submit: error.response?.data?.error || t('join.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Service Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('join.service')} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedService}
          onChange={(e) => {
            setSelectedService(e.target.value);
            if (errors.service) setErrors({ ...errors, service: null });
          }}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all"
        >
          <option value="">{t('join.service')}</option>
          {services.map((service) => (
            <option key={service.service_id} value={service.service_id}>
              {service.service_name}
            </option>
          ))}
        </select>
        {errors.service && (
          <p className="text-sm text-red-500 mt-1">{errors.service}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('join.phoneNumber')} <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">
            +255
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 9);
              setPhoneNumber(value);
              if (errors.phone) setErrors({ ...errors, phone: null });
            }}
            placeholder={t('join.phonePlaceholder')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-r-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-transparent transition-all"
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {t('join.phoneHint')}
        </p>
        {errors.phone && (
          <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-[#0099CC] to-[#00B140] text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            {t('join.joining')}
          </>
        ) : (
          t('join.joinButton')
        )}
      </button>
    </form>
  );
};

export default JoinForm;