import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PixelInstallationCode from './PixelInstallationCode';

const SiteDetailDrawer = ({ site, isOpen, onClose }) => {
  const [showInstallCode, setShowInstallCode] = useState(false);

  if (!site) return null;

  // Use environment variable for API endpoint
  const apiEndpoint = import.meta.env.VITE_API_URL || 'https://pixel.edwinlovett.com/api';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-96 bg-ash-light/95 backdrop-blur-xl border-l border-white/10 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto shadow-2xl`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">{site.url}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Toggle between Details and Installation Code */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowInstallCode(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !showInstallCode
                  ? 'bg-red-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setShowInstallCode(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                showInstallCode
                  ? 'bg-red-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Install Code
            </button>
          </div>

          {showInstallCode ? (
            <PixelInstallationCode siteUrl={site.url} apiEndpoint={apiEndpoint} />
          ) : (
            <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white mb-3">Tag Status</h3>
              <div className="space-y-2">
                {site.trackedPixels.gtm.enabled && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">GTM Container</span>
                    <span className="text-sm text-white">{site.trackedPixels.gtm.containerId || 'Not set'}</span>
                  </div>
                )}
                {site.trackedPixels.ga4.enabled && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">GA4 Property</span>
                    <span className="text-sm text-white">{site.trackedPixels.ga4.measurementId || 'Not set'}</span>
                  </div>
                )}
                {site.trackedPixels.meta.enabled && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">Meta Pixel</span>
                    <span className="text-sm text-white">{site.trackedPixels.meta.pixelId || 'Not set'}</span>
                  </div>
                )}
                {site.trackedPixels.xandr.enabled && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">Xandr Pixel</span>
                    <span className="text-sm text-white">{site.trackedPixels.xandr.pixelId || 'Not set'}</span>
                  </div>
                )}
                {site.trackedPixels.simplifi.enabled && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm text-gray-400">Simpli.fi Pixel</span>
                    <span className="text-sm text-white">{site.trackedPixels.simplifi.pixelId || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-3">Network Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Last Heartbeat</span>
                  <span className="text-sm text-white">
                    {formatDistanceToNow(site.lastSeen, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Added Date</span>
                  <span className="text-sm text-white">
                    {new Date(site.addedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-3">Consent Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className={`text-sm font-medium ${
                    site.consentStatus === 'granted' ? 'text-green-500' :
                    site.consentStatus === 'denied' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {site.consentStatus.charAt(0).toUpperCase() + site.consentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {site.gtmAccountEmails && site.gtmAccountEmails.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-white mb-3">GTM Account Access</h3>
                <div className="space-y-1">
                  {site.gtmAccountEmails.map((email, idx) => (
                    <div key={idx} className="text-sm text-gray-400 py-1">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {site.notificationEmails && site.notificationEmails.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Notification Recipients</h3>
                <div className="space-y-1">
                  {site.notificationEmails.map((email, idx) => (
                    <div key={idx} className="text-sm text-gray-400 py-1">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {site.notes && (
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Notes</h3>
                <p className="text-sm text-gray-400">{site.notes}</p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SiteDetailDrawer;
