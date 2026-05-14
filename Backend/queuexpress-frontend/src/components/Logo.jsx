import React from 'react';
import wordLogo from '../assets/word-logo.png';
import iconLogo from '../assets/icon-logo.png';  // If you have icon file

const Logo = ({ 
  type = 'full',  // 'full', 'icon', 'word'
  className = "h-10 w-auto",
  size = 'md'  // 'sm', 'md', 'lg'
}) => {
  
  const sizes = {
    sm: { height: 'h-8', text: 'text-xl' },
    md: { height: 'h-10', text: 'text-2xl' },
    lg: { height: 'h-14', text: 'text-3xl' }
  };
  
  const currentSize = sizes[size];
  
  // If type is 'icon' and we have icon logo
  if (type === 'icon' && iconLogo) {
    return (
      <img 
        src={iconLogo} 
        alt="QueueXpress Icon" 
        className={`${currentSize.height} w-auto object-contain`}
      />
    );
  }
  
  // If type is 'word' or 'full' with text
  if (type === 'word' || type === 'full') {
    return (
      <div className="flex items-center space-x-2">
        {type === 'full' && iconLogo && (
          <img 
            src={iconLogo} 
            alt="QueueXpress" 
            className={`${currentSize.height} w-auto object-contain`}
          />
        )}
        <img 
          src={wordLogo} 
          alt="QueueXpress" 
          className={`${currentSize.height} w-auto object-contain`}
        />
      </div>
    );
  }
  
  // Fallback if images don't load
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-xl">
        <span className="text-white text-2xl">Q</span>
      </div>
      <div>
        <h1 className={`${currentSize.text} font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
          QueueXpress
        </h1>
        <p className="text-xs text-gray-500">Queue Management System</p>
      </div>
    </div>
  );
};

export default Logo;