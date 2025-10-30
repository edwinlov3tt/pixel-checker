import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import DashboardView from './components/Dashboard/DashboardView';
import SitesView from './components/Sites/SitesView';
import { SitesProvider } from './context/SitesContext';
import { MonitoringProvider } from './context/MonitoringContext';

const App = () => {
  return (
    <SitesProvider>
      <MonitoringProvider>
        <div className="min-h-screen bg-gradient-to-br from-ash-dark to-ash-medium">
          <Header />
          <Sidebar />
          <MainContent>
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/sites" element={<SitesView />} />
              <Route path="/alerts" element={<AlertsView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </MainContent>
        </div>
      </MonitoringProvider>
    </SitesProvider>
  );
};

// Placeholder views
const AlertsView = () => (
  <div className="glassmorphism-card p-8">
    <h1 className="text-3xl font-bold text-white mb-6">Alerts</h1>
    <p className="text-gray-400">Alerts functionality coming soon...</p>
  </div>
);

const SettingsView = () => (
  <div className="glassmorphism-card p-8">
    <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
    <p className="text-gray-400">Settings functionality coming soon...</p>
  </div>
);

export default App;