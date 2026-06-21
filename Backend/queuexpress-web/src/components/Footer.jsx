import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 mt-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center gap-2">
          {/* Support Email & Phone - Row on desktop, column on mobile */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <a
              href="mailto:support@queuexpress.com"
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-[#0099CC] dark:hover:text-[#0099CC] transition-colors"
            >
              <FaEnvelope className="text-[#0099CC] text-sm" />
              <span>{t('footer.supportEmail')}</span>
            </a>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
            <a
              href="tel:+255623101586"
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-[#00B140] dark:hover:text-[#00B140] transition-colors"
            >
              <FaPhone className="text-[#00B140] text-sm" />
              <span>{t('footer.supportPhone')}</span>
            </a>
          </div>

          {/* Copyright */}
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            {t('footer.copyright')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;