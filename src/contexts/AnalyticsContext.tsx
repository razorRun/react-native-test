import React, { createContext, useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';

const AnalyticsContext = createContext(null);

// Performance Issue: Heavy analytics tracking
export const AnalyticsProvider = ({ children }) => {
  const events = useRef([]);
  const timers = useRef({});
  const metrics = useRef({
    renders: 0,
    interactions: 0,
    errors: 0,
    apiCalls: 0,
  });
  
  // Performance Issue: Listening to all events without cleanup
  useEffect(() => {
    const listeners = [
      DeviceEventEmitter.addListener('*', handleAnyEvent), // Listening to ALL events!
      DeviceEventEmitter.addListener('analyticsEvent', handleAnalyticsEvent),
      DeviceEventEmitter.addListener('error', handleError),
    ];
    
    // Performance Issue: Creating timers for metrics
    Object.keys(metrics.current).forEach(key => {
      timers.current[key] = setInterval(() => {
        console.log(`${key}: ${metrics.current[key]}`);
      }, 1000);
    });
  }, []);
  
  const handleAnyEvent = (eventType, data) => {
    // Performance Issue: Growing events array without limit
    events.current.push({
      type: eventType,
      data: JSON.parse(JSON.stringify(data || {})), // Deep clone!
      timestamp: Date.now(),
      stackTrace: new Error().stack,
    });
    
    // Performance Issue: Processing all events
    processEvent(eventType, data);
  };
  
  const handleAnalyticsEvent = (event) => {
    metrics.current.interactions += 1;
    
    // Performance Issue: Complex event processing
    const enrichedEvent = {
      ...event,
      sessionId: Date.now(),
      deviceInfo: {
        platform: 'iOS',
        version: '14.0',
        model: 'iPhone 12',
      },
      // Performance Issue: Creating large arrays
      context: events.current.slice(-100),
    };
    
    sendToAnalytics(enrichedEvent);
  };
  
  const handleError = (error) => {
    metrics.current.errors += 1;
    
    // Performance Issue: Storing full error objects
    events.current.push({
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        // Performance Issue: Circular reference
        allEvents: events.current,
      },
    });
  };
  
  const processEvent = (type, data) => {
    // Performance Issue: Switch with many cases
    switch (type) {
      case 'render':
        metrics.current.renders += 1;
        break;
      case 'api':
        metrics.current.apiCalls += 1;
        break;
      default:
        // Performance Issue: Regex on every event
        if (/^(click|tap|press)/.test(type)) {
          metrics.current.interactions += 1;
        }
    }
  };
  
  const sendToAnalytics = async (event) => {
    // Simulating analytics API call
    console.log('Sending analytics:', event);
  };
  
  // Performance Issue: Re-rendering on every mount
  useEffect(() => {
    metrics.current.renders += 1;
  });
  
  return (
    <AnalyticsContext.Provider value={null}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;