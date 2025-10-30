import React from 'react';
import SiteRow from './SiteRow';

const SitesTable = ({ sites, onSiteSelect }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Site</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">GTM</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">GA4</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Meta</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Xandr</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Simpli.fi</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Consent</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Last Seen</th>
            <th className="text-left py-4 px-3 font-semibold text-gray-500 text-sm">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <SiteRow
              key={site.id}
              site={site}
              onClick={() => onSiteSelect(site)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SitesTable;