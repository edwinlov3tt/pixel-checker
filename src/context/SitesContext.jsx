import React, { createContext, useContext, useState, useEffect } from 'react';
import { sitesAPI } from '../services/api';
import { getStoredSites, storeSites } from '../services/localStorage';
import { generateMockSites } from '../services/mockData';

const SitesContext = createContext();

export const useSites = () => {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error('useSites must be used within a SitesProvider');
  }
  return context;
};

export const SitesProvider = ({ children }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const token = localStorage.getItem('pixel_checker_token');

      if (!token) {
        // No authentication - use mock data
        console.log('No auth token found, using mock data');
        const storedSites = getStoredSites();
        if (storedSites.length > 0) {
          setSites(storedSites);
        } else {
          const mockSites = generateMockSites();
          setSites(mockSites);
          storeSites(mockSites);
        }
        setError(null);
      } else {
        // Try to load from API
        const apiSites = await sitesAPI.getAll();
        setSites(apiSites);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setError(err.message);
      // Fallback to mock data if API fails
      const storedSites = getStoredSites();
      if (storedSites.length > 0) {
        setSites(storedSites);
      } else {
        const mockSites = generateMockSites();
        setSites(mockSites);
        storeSites(mockSites);
      }
    } finally {
      setLoading(false);
    }
  };

  const addSite = async (siteData) => {
    try {
      const token = localStorage.getItem('pixel_checker_token');

      if (!token) {
        // No authentication - add to mock data
        const newSite = {
          id: Date.now().toString(),
          url: siteData.url,
          name: siteData.name,
          addedDate: new Date(),
          trackedPixels: siteData.trackedPixels,
          status: {
            gtm: 'active',
            ga4: 'active',
            meta: 'active',
            xandr: 'active',
            simplifi: 'active',
          },
          lastSeen: new Date(),
          notes: siteData.notes,
          consentStatus: 'pending',
          gtmAccountEmails: siteData.gtmAccountEmails || [],
          notificationEmails: siteData.notificationEmails || [],
        };

        const updatedSites = [...sites, newSite];
        setSites(updatedSites);
        storeSites(updatedSites);
        setError(null);
        return newSite;
      }

      // Transform frontend format to backend format
      const backendData = {
        url: siteData.url,
        name: siteData.name,
        gtmContainerId: siteData.trackedPixels?.gtm?.enabled ? siteData.trackedPixels.gtm.containerId : null,
        ga4MeasurementId: siteData.trackedPixels?.ga4?.enabled ? siteData.trackedPixels.ga4.measurementId : null,
        metaPixelId: siteData.trackedPixels?.meta?.enabled ? siteData.trackedPixels.meta.pixelId : null,
        gtmAccountEmails: siteData.gtmAccountEmails || [],
        notificationEmails: siteData.notificationEmails || [],
        notes: siteData.notes
      };

      const newSite = await sitesAPI.create(backendData);
      setSites([...sites, newSite]);
      setError(null);
      return newSite;
    } catch (err) {
      console.error('Failed to add site:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateSite = async (siteId, updates) => {
    try {
      const token = localStorage.getItem('pixel_checker_token');

      if (!token) {
        // No authentication - update mock data
        const updatedSites = sites.map(site =>
          site.id === siteId ? { ...site, ...updates } : site
        );
        setSites(updatedSites);
        storeSites(updatedSites);
        setError(null);
        return updatedSites.find(s => s.id === siteId);
      }

      const updatedSite = await sitesAPI.update(siteId, updates);
      const updatedSites = sites.map(site =>
        site.id === siteId ? updatedSite : site
      );
      setSites(updatedSites);
      setError(null);
      return updatedSite;
    } catch (err) {
      console.error('Failed to update site:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteSite = async (siteId) => {
    try {
      const token = localStorage.getItem('pixel_checker_token');

      if (!token) {
        // No authentication - delete from mock data
        const updatedSites = sites.filter(site => site.id !== siteId);
        setSites(updatedSites);
        storeSites(updatedSites);
        setError(null);
        return;
      }

      await sitesAPI.delete(siteId);
      const updatedSites = sites.filter(site => site.id !== siteId);
      setSites(updatedSites);
      setError(null);
    } catch (err) {
      console.error('Failed to delete site:', err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <SitesContext.Provider value={{ sites, addSite, updateSite, deleteSite, loading, error }}>
      {children}
    </SitesContext.Provider>
  );
};