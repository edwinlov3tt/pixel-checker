import React, { useState } from 'react';
import { X } from 'lucide-react';
import PixelSelector from '../Pixels/PixelSelector';
import Button from '../Common/Button';
import ChipInput from '../Common/ChipInput';

const AddSiteModal = ({ isOpen, onClose, onAddSite }) => {
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    trackedPixels: {
      gtm: { enabled: false, containerId: '' },
      ga4: { enabled: false, measurementId: '' },
      meta: { enabled: false, pixelId: '' },
      xandr: { enabled: false, pixelId: '' },
      simplifi: { enabled: false, pixelId: '' },
    },
    gtmAccountEmails: [],
    notificationEmails: [],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onAddSite(formData);
      // Reset form on success
      setFormData({
        url: '',
        name: '',
        trackedPixels: {
          gtm: { enabled: false, containerId: '' },
          ga4: { enabled: false, measurementId: '' },
          meta: { enabled: false, pixelId: '' },
          xandr: { enabled: false, pixelId: '' },
          simplifi: { enabled: false, pixelId: '' },
        },
        gtmAccountEmails: [],
        notificationEmails: [],
        notes: '',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add site');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePixelChange = (pixelType, data) => {
    setFormData(prev => ({
      ...prev,
      trackedPixels: {
        ...prev.trackedPixels,
        [pixelType]: data,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glassmorphism-card p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Add New Site</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site URL
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-red transition-colors"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-red transition-colors"
              placeholder="My Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Select Pixels to Track
            </label>
            <PixelSelector
              pixels={formData.trackedPixels}
              onChange={handlePixelChange}
            />
          </div>

          <ChipInput
            label="GTM Account Emails"
            value={formData.gtmAccountEmails}
            onChange={(emails) => setFormData({ ...formData, gtmAccountEmails: emails })}
            placeholder="Enter email addresses for GTM account access"
            type="email"
          />

          <ChipInput
            label="Notification Emails"
            value={formData.notificationEmails}
            onChange={(emails) => setFormData({ ...formData, notificationEmails: emails })}
            placeholder="Enter emails to notify if pixels aren't detected"
            type="email"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-red transition-colors h-24 resize-none"
              placeholder="Additional notes about this site..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Site'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;