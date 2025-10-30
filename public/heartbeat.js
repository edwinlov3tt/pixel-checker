/**
 * Pixel Checker Heartbeat Script
 *
 * Monitors GTM, GA4, and Meta Pixel presence and firing status
 * Sends real-time status to monitoring dashboard
 *
 * Installation:
 * 1. Via GTM Custom HTML tag (recommended):
 *    <script src="https://pixel.edwinlovett.com/heartbeat.js" data-site-url="https://yoursite.com"></script>
 *
 * 2. Direct embed in <head>:
 *    <script src="https://pixel.edwinlovett.com/heartbeat.js" data-site-url="https://yoursite.com"></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Get API endpoint from script data attribute or use default
    apiEndpoint: (function() {
      const script = document.currentScript;
      return script?.getAttribute('data-api-endpoint') || 'https://pixel.edwinlovett.com/api/ingest';
    })(),

    // Get site URL from script data attribute or use current location
    siteUrl: (function() {
      const script = document.currentScript;
      return script?.getAttribute('data-site-url') || window.location.origin;
    })(),

    // How long to wait before sending heartbeat (to catch network requests)
    waitTime: 3000,

    // Enable debug logging
    debug: false
  };

  // Debug logger
  function log(...args) {
    if (CONFIG.debug) {
      console.log('[Pixel Checker]', ...args);
    }
  }

  // Heartbeat data object
  const heartbeat = {
    siteUrl: CONFIG.siteUrl,
    pageUrl: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,

    // GTM Detection
    gtmPresent: false,
    gtmContainerId: null,

    // GA4 Detection
    ga4Present: false,
    ga4TagPresent: false,
    ga4CollectSeen: false,
    ga4MeasurementId: null,

    // Meta Pixel Detection
    metaPixelPresent: false,
    metaTrSeen: false,
    metaPixelId: null,

    // Consent State
    consentState: null,
    consentGranted: null
  };

  /**
   * Detect Google Tag Manager
   */
  function detectGTM() {
    // Check for dataLayer
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      heartbeat.gtmPresent = true;
      log('✓ GTM dataLayer detected');

      // Try to extract GTM container ID from dataLayer or global vars
      if (window.google_tag_manager) {
        const containers = Object.keys(window.google_tag_manager);
        const gtmContainer = containers.find(key => key.startsWith('GTM-'));
        if (gtmContainer) {
          heartbeat.gtmContainerId = gtmContainer;
          log('✓ GTM Container ID:', gtmContainer);
        }
      }
    }
  }

  /**
   * Detect GA4
   */
  function detectGA4() {
    // Check for gtag function
    if (typeof window.gtag === 'function') {
      heartbeat.ga4TagPresent = true;
      heartbeat.ga4Present = true;
      log('✓ GA4 gtag detected');
    }

    // Check for GA4 config in dataLayer
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      for (const item of window.dataLayer) {
        if (item && item[0] === 'config' && typeof item[1] === 'string' && item[1].startsWith('G-')) {
          heartbeat.ga4MeasurementId = item[1];
          heartbeat.ga4Present = true;
          log('✓ GA4 Measurement ID:', item[1]);
          break;
        }
      }
    }
  }

  /**
   * Detect Meta Pixel (Facebook Pixel)
   */
  function detectMetaPixel() {
    // Check for fbq function
    if (typeof window.fbq === 'function') {
      heartbeat.metaPixelPresent = true;
      log('✓ Meta Pixel fbq detected');

      // Try to extract pixel ID
      if (window._fbq && window._fbq.instance && window._fbq.instance.pixelId) {
        heartbeat.metaPixelId = window._fbq.instance.pixelId;
        log('✓ Meta Pixel ID:', heartbeat.metaPixelId);
      }
    }
  }

  /**
   * Detect Consent Mode state (Google Consent Mode V2)
   */
  function detectConsent() {
    // Check for Google Consent Mode
    if (window.google_tag_data && window.google_tag_data.consent) {
      heartbeat.consentState = window.google_tag_data.consent;
      log('✓ Consent state:', heartbeat.consentState);

      // Check if analytics consent is granted
      const consentData = window.google_tag_data.consent;
      if (consentData.analytics_storage === 'granted' && consentData.ad_storage === 'granted') {
        heartbeat.consentGranted = true;
      } else if (consentData.analytics_storage === 'denied' || consentData.ad_storage === 'denied') {
        heartbeat.consentGranted = false;
      }
    }

    // Also check dataLayer for consent updates
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      for (const item of window.dataLayer) {
        if (item && item[0] === 'consent' && item[1] === 'update') {
          heartbeat.consentState = item[2];
          log('✓ Consent update in dataLayer:', item[2]);

          if (item[2]?.analytics_storage) {
            heartbeat.consentGranted = item[2].analytics_storage === 'granted';
          }
          break;
        }
      }
    }
  }

  /**
   * Monitor network requests to confirm pixels are actually firing
   */
  function monitorNetworkRequests() {
    try {
      // Use PerformanceObserver to watch for network requests
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const url = entry.name;

          // Check for GA4 collect requests
          if (url.includes('google-analytics.com/g/collect') || url.includes('google-analytics.com/mp/collect')) {
            heartbeat.ga4CollectSeen = true;
            log('✓ GA4 collect request seen:', url);
          }

          // Check for Meta Pixel tr requests
          if (url.includes('facebook.com/tr')) {
            heartbeat.metaTrSeen = true;
            log('✓ Meta Pixel tr request seen:', url);
          }
        }
      });

      observer.observe({
        entryTypes: ['resource'],
        buffered: true // Include resources loaded before observer was created
      });

      // Keep observer active during wait period
      return observer;

    } catch (error) {
      log('⚠ PerformanceObserver not supported or failed:', error);
      return null;
    }
  }

  /**
   * Send heartbeat data to API
   */
  function sendHeartbeat() {
    log('Sending heartbeat:', heartbeat);

    // Use sendBeacon for reliability (works even if page is closing)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(heartbeat)], { type: 'application/json' });
      const success = navigator.sendBeacon(CONFIG.apiEndpoint, blob);

      if (success) {
        log('✓ Heartbeat sent via sendBeacon');
      } else {
        log('⚠ sendBeacon failed, falling back to fetch');
        fallbackFetch();
      }
    } else {
      // Fallback to fetch
      fallbackFetch();
    }
  }

  /**
   * Fallback to fetch if sendBeacon is not available
   */
  function fallbackFetch() {
    fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(heartbeat),
      keepalive: true
    })
    .then(response => {
      if (response.ok) {
        log('✓ Heartbeat sent via fetch');
      } else {
        log('⚠ Heartbeat failed:', response.status, response.statusText);
      }
    })
    .catch(error => {
      log('⚠ Heartbeat error:', error);
    });
  }

  /**
   * Initialize heartbeat monitoring
   */
  function init() {
    log('Initializing Pixel Checker heartbeat...');
    log('Config:', CONFIG);

    // Run initial detections
    detectGTM();
    detectGA4();
    detectMetaPixel();
    detectConsent();

    // Start monitoring network requests
    const observer = monitorNetworkRequests();

    // Wait for network activity to settle, then send heartbeat
    setTimeout(() => {
      // Disconnect observer
      if (observer) {
        observer.disconnect();
      }

      // Send heartbeat
      sendHeartbeat();
    }, CONFIG.waitTime);
  }

  // Start monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

  // Also send on page unload (to catch any last-minute data)
  window.addEventListener('beforeunload', () => {
    // Quick final check
    detectGA4();
    detectMetaPixel();
  });

})();
