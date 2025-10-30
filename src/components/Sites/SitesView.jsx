import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import SitesTable from './SitesTable';
import AddSiteModal from './AddSiteModal';
import SiteDetailDrawer from './SiteDetailDrawer';
import Button from '../Common/Button';
import { useSites } from '../../context/SitesContext';

const SitesView = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const { sites, addSite } = useSites();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white fade-in">Sites Management</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Site
        </Button>
      </div>

      <div className="glassmorphism-card p-8 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">All Sites ({sites.length})</h2>
        </div>
        <SitesTable sites={sites} onSiteSelect={setSelectedSite} />
      </div>

      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSite={addSite}
      />

      <SiteDetailDrawer
        site={selectedSite}
        isOpen={!!selectedSite}
        onClose={() => setSelectedSite(null)}
      />
    </div>
  );
};

export default SitesView;