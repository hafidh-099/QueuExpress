import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTheme, saveTheme } from '../storage/storage';
import { getColors } from '../theme/colors';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [colors, setColorsState] = useState(getColors('light'));

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await getTheme();
    const themeValue = savedTheme || 'light';
    setTheme(themeValue);
    setColorsState(getColors(themeValue));
  };

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    setColorsState(getColors(newTheme));
    await saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};