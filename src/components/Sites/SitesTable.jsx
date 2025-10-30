import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import SiteRow from './SiteRow';

const SitesTable = ({ sites, onSiteSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) {
      return sites;
    }

    const query = searchQuery.toLowerCase();
    return sites.filter(site =>
      site.url.toLowerCase().includes(query) ||
      site.notes?.toLowerCase().includes(query)
    );
  }, [sites, searchQuery]);

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sites by URL or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary/50 transition-all"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-400">
            Found {filteredSites.length} of {sites.length} sites
          </p>
        )}
      </div>

      {/* Table */}
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
            {filteredSites.length > 0 ? (
              filteredSites.map((site) => (
                <SiteRow
                  key={site.id}
                  site={site}
                  onClick={() => onSiteSelect(site)}
                />
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-400">
                  No sites found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SitesTable;