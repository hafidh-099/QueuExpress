import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaSun, FaMoon, FaGlobe } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import iconLogo from '../assets/icon-logo.png';

const Header = ({ language, setLanguage }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    localStorage.setItem('queuexpress-language', newLang);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={iconLogo} 
            alt="QueueXpress" 
            className="h-10 w-10 md:h-14 md:w-14 object-contain"
          />
          <span className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Queue<span className="text-[#0099CC]">Xpress</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <FaGlobe size={14} />
            <span>{language === 'en' ? 'EN' : 'SW'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;