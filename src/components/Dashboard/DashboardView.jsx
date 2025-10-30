import React, { useState, useEffect } from 'react';
import StatsGrid from './StatsGrid';
import SitesTable from '../Sites/SitesTable';
import SiteDetailDrawer from '../Sites/SiteDetailDrawer';
import { useSites } from '../../context/SitesContext';

const DashboardView = () => {
  const { sites } = useSites();
  const [selectedSite, setSelectedSite] = useState(null);

  const stats = [
    { label: 'Total Sites', value: sites.length, change: '+3 this month', trend: 'positive' },
    { label: 'Active Tags', value: '67', change: '+2 today', trend: 'positive' },
    { label: 'Issues Found', value: '3', change: '+1 today', trend: 'negative' },
    { label: 'Uptime', value: '99.2%', change: '+0.1% this week', trend: 'positive' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6 fade-in">Dashboard</h1>
      <StatsGrid stats={stats} />
      <div className="glassmorphism-card p-8 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Monitored Sites</h2>
        </div>
        <SitesTable sites={sites} onSiteSelect={setSelectedSite} />
      </div>

      <SiteDetailDrawer
        site={selectedSite}
        isOpen={!!selectedSite}
        onClose={() => setSelectedSite(null)}
      />
    </div>
  );
};

export default DashboardView;