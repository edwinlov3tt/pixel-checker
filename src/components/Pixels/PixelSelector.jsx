import React from 'react';

const PixelSelector = ({ pixels, onChange }) => {
  const pixelTypes = [
    { key: 'gtm', label: 'Google Tag Manager', placeholder: 'GTM-XXXX' },
    { key: 'ga4', label: 'Google Analytics 4', placeholder: 'G-XXXX' },
    { key: 'meta', label: 'Meta Pixel', placeholder: 'Pixel ID' },
    { key: 'xandr', label: 'Xandr', placeholder: 'Pixel ID' },
    { key: 'simplifi', label: 'Simpli.fi', placeholder: 'Pixel ID' },
  ];

  const handleToggle = (pixelKey) => {
    const currentPixel = pixels[pixelKey];
    onChange(pixelKey, {
      ...currentPixel,
      enabled: !currentPixel.enabled,
    });
  };

  const handleIdChange = (pixelKey, value) => {
    const currentPixel = pixels[pixelKey];
    const idField = pixelKey === 'gtm' ? 'containerId' :
                    pixelKey === 'ga4' ? 'measurementId' : 'pixelId';
    onChange(pixelKey, {
      ...currentPixel,
      [idField]: value,
    });
  };

  return (
    <div className="space-y-4">
      {pixelTypes.map((pixel) => (
        <div key={pixel.key} className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={pixels[pixel.key].enabled}
              onChange={() => handleToggle(pixel.key)}
              className="w-4 h-4 rounded border-gray-600 bg-white/10 text-brand-red focus:ring-brand-red focus:ring-offset-0"
            />
            <span className="text-gray-300">{pixel.label}</span>
          </label>
          {pixels[pixel.key].enabled && (
            <input
              type="text"
              value={
                pixel.key === 'gtm' ? pixels[pixel.key].containerId :
                pixel.key === 'ga4' ? pixels[pixel.key].measurementId :
                pixels[pixel.key].pixelId
              }
              onChange={(e) => handleIdChange(pixel.key, e.target.value)}
              placeholder={pixel.placeholder}
              className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PixelSelector;