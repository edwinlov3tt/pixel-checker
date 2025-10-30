const SITES_KEY = 'pixel_monitor_sites';

export const getStoredSites = () => {
  try {
    const stored = localStorage.getItem(SITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading sites from localStorage:', error);
    return [];
  }
};

export const storeSites = (sites) => {
  try {
    localStorage.setItem(SITES_KEY, JSON.stringify(sites));
  } catch (error) {
    console.error('Error saving sites to localStorage:', error);
  }
};