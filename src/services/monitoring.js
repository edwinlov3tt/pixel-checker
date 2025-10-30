// Simulate monitoring updates
export const simulateMonitoring = (site) => {
  // Random chance of status change (10%)
  if (Math.random() < 0.1) {
    const statuses = ['active', 'missing', 'blocked'];
    const pixels = ['gtm', 'ga4', 'meta', 'xandr', 'simplifi'];
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Only update if the pixel is being tracked
    if (site.trackedPixels[randomPixel].enabled) {
      return {
        status: {
          ...site.status,
          [randomPixel]: randomStatus,
        },
        lastSeen: new Date(),
      };
    }
  }

  // Update last seen time (50% chance)
  if (Math.random() < 0.5) {
    return {
      lastSeen: new Date(),
    };
  }

  return null;
};