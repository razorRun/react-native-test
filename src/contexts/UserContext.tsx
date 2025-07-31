import React, { createContext, useState, useContext, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

const UserContext = createContext(null);

// Performance Issue: User data polling and state updates
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [activity, setActivity] = useState([]);
  const [sessionData, setSessionData] = useState({});
  
  // Performance Issue: Polling user data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulating user data fetch
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, // Changes every poll!
        lastActive: new Date(),
      };
      
      setUser(userData);
      
      // Performance Issue: Growing activity array
      setActivity(prev => [...prev, {
        type: 'poll',
        timestamp: Date.now(),
        data: userData,
      }]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Performance Issue: Session tracking on every render
  useEffect(() => {
    const session = {
      startTime: Date.now(),
      renderCount: (sessionData.renderCount || 0) + 1,
      interactions: [],
      // Performance Issue: Creating large objects
      metadata: {
        userAgent: 'React Native',
        platform: 'iOS',
        version: '1.0.0',
        buildNumber: 100,
        environment: 'production',
        features: Array.from({ length: 50 }, (_, i) => `feature_${i}`),
      },
    };
    
    setSessionData(session);
  });
  
  const updatePreferences = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
      lastUpdated: new Date(),
    }));
    
    // Performance Issue: Emit event for every preference change
    DeviceEventEmitter.emit('preferenceChanged', { key, value });
  };
  
  const trackInteraction = (interaction) => {
    setActivity(prev => [...prev, {
      ...interaction,
      timestamp: Date.now(),
      sessionId: sessionData.startTime,
    }]);
  };
  
  // Performance Issue: Complex value object
  const value = {
    user,
    preferences,
    activity,
    sessionData,
    updatePreferences,
    trackInteraction,
    // Performance Issue: Computed properties in context value
    isLoggedIn: !!user,
    activityCount: activity.length,
    sessionDuration: Date.now() - (sessionData.startTime || 0),
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserProvider;