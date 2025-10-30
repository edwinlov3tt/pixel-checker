import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import Button from '../Common/Button';

const PixelInstallationCode = ({ siteUrl, apiEndpoint }) => {
  const [copied, setCopied] = useState(false);

  // Get the base URL without /api suffix
  const baseUrl = apiEndpoint?.replace('/api', '') || 'https://pixel.edwinlovett.com';

  // Generate the installation snippet
  const installationCode = `<!-- Pixel Checker Monitoring Script -->
<script
  src="${baseUrl}/heartbeat.js"
  data-site-url="${siteUrl}"
  data-api-endpoint="${baseUrl}/api/ingest"
></script>`;

  const gtmCode = `<!-- Pixel Checker via GTM Custom HTML Tag -->
<script
  src="${baseUrl}/heartbeat.js"
  data-site-url="${siteUrl}"
  data-api-endpoint="${baseUrl}/api/ingest"
></script>

<!--
GTM Setup Instructions:
1. Create new tag: Custom HTML
2. Paste code above
3. Set trigger: All Pages
4. Publish container
-->`;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-primary/10 flex items-center justify-center">
          <Code className="w-5 h-5 text-red-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Installation Code</h3>
          <p className="text-sm text-gray-400">Add this snippet to start monitoring</p>
        </div>
      </div>

      {/* Direct Installation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Direct Installation (in &lt;head&gt;)</label>
          <Button
            onClick={() => handleCopy(installationCode)}
            variant="secondary"
            size="sm"
            icon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code className="text-xs text-gray-300 font-mono whitespace-pre">{installationCode}</code>
        </pre>
      </div>

      {/* GTM Installation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Google Tag Manager Installation</label>
          <Button
            onClick={() => handleCopy(gtmCode)}
            variant="secondary"
            size="sm"
            icon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
          <code className="text-xs text-gray-300 font-mono whitespace-pre">{gtmCode}</code>
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">What happens after installation?</h4>
        <ul className="text-sm text-gray-300 space-y-1.5">
          <li>• The script loads on every page view</li>
          <li>• Detects GTM, GA4, and Meta Pixel presence</li>
          <li>• Monitors actual pixel firing (not just presence)</li>
          <li>• Sends status updates to this dashboard</li>
          <li>• Updates appear within 3-5 seconds of page load</li>
        </ul>
      </div>

      {/* Testing */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-400 mb-2">Testing Installation</h4>
        <ol className="text-sm text-gray-300 space-y-1.5 list-decimal list-inside">
          <li>Install the snippet on your site</li>
          <li>Visit any page on the site</li>
          <li>Open DevTools → Network tab</li>
          <li>Look for request to <code className="text-xs bg-black/40 px-1 py-0.5 rounded">/api/ingest</code></li>
          <li>Check this dashboard - status should update automatically</li>
        </ol>
      </div>
    </div>
  );
};

export default PixelInstallationCode;
