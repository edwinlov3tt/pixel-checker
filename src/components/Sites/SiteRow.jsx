import React from 'react';
import StatusDot from '../Common/StatusDot';
import { formatDistanceToNow } from 'date-fns';

const SiteRow = ({ site, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
    >
      <td className="py-4 px-3 font-semibold text-white">{site.url}</td>
      <td className="py-4 px-3">
        <StatusDot status={site.status.gtm} tooltip={site.trackedPixels.gtm.containerId} />
      </td>
      <td className="py-4 px-3">
        <StatusDot status={site.status.ga4} tooltip={site.trackedPixels.ga4.measurementId} />
      </td>
      <td className="py-4 px-3">
        <StatusDot status={site.status.meta} tooltip={site.trackedPixels.meta.pixelId} />
      </td>
      <td className="py-4 px-3">
        <StatusDot status={site.status.xandr} tooltip={site.trackedPixels.xandr.pixelId} />
      </td>
      <td className="py-4 px-3">
        <StatusDot status={site.status.simplifi} tooltip={site.trackedPixels.simplifi.pixelId} />
      </td>
      <td className="py-4 px-3">
        <StatusDot status={site.consentStatus === 'granted' ? 'active' : site.consentStatus === 'denied' ? 'missing' : 'blocked'} />
      </td>
      <td className="py-4 px-3 text-xs text-gray-500">
        {formatDistanceToNow(site.lastSeen, { addSuffix: true })}
      </td>
      <td className="py-4 px-3 text-xs text-gray-400 max-w-[200px] truncate">
        {site.notes}
      </td>
    </tr>
  );
};

export default SiteRow;