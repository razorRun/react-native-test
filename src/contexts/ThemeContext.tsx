import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, DeviceEventEmitter } from 'react-native';

const ThemeContext = createContext(null);

// Performance Issue: Theme calculations on every render
const themes = {
  light: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    background: '#ffffff',
    cardBackground: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    tagBackground: '#e9ecef',
    tagText: '#495057',
    dark: false,
  },
  dark: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    background: '#000000',
    cardBackground: '#212529',
    text: '#ffffff',
    textSecondary: '#adb5bd',
    border: '#495057',
    tagBackground: '#343a40',
    tagText: '#f8f9fa',
    dark: true,
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');
  const [customColors, setCustomColors] = useState({});
  const [themeHistory, setThemeHistory] = useState([]);
  
  // Performance Issue: Listening to system theme changes without cleanup
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('System theme changed to:', colorScheme);
      // Performance Issue: State update on every system theme change
      setThemeName(colorScheme || 'light');
    });
  }, []);
  
  // Performance Issue: Computing theme on every render
  const theme = {
    ...themes[themeName],
    ...customColors,
    // Performance Issue: Creating gradient arrays on every render
    gradients: {
      primary: ['#007bff', '#0056b3', '#003d82'],
      secondary: ['#6c757d', '#545b62', '#343a40'],
      success: ['#28a745', '#218838', '#1e7e34'],
    },
    // Performance Issue: Creating shadow objects on every render
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
  };
  
  const toggleTheme = () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);
    
    // Performance Issue: Recording all theme changes
    setThemeHistory(prev => [...prev, {
      from: themeName,
      to: newTheme,
      timestamp: Date.now(),
    }]);
    
    // Performance Issue: Emitting events on theme change
    DeviceEventEmitter.emit('themeChanged', { theme: newTheme });
  };
  
  const setCustomColor = (key, color) => {
    setCustomColors(prev => ({ ...prev, [key]: color }));
  };
  
  // Performance Issue: Value object with functions recreated on every render
  const value = {
    theme,
    themeName,
    toggleTheme,
    setCustomColor,
    themeHistory,
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeProvider;