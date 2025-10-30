import React, { createContext, useContext, useEffect } from 'react';
import { useSites } from './SitesContext';
import { simulateMonitoring } from '../services/monitoring';

const MonitoringContext = createContext();

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};

export const MonitoringProvider = ({ children }) => {
  const { sites, updateSite } = useSites();

  useEffect(() => {
    // Set up monitoring simulation
    const interval = setInterval(() => {
      sites.forEach(site => {
        const updates = simulateMonitoring(site);
        if (updates) {
          updateSite(site.id, updates);
        }
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [sites, updateSite]);

  return (
    <MonitoringContext.Provider value={{}}>
      {children}
    </MonitoringContext.Provider>
  );
};