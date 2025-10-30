import express from 'express';
import { heartbeatService } from '../services/heartbeatService.js';

const router = express.Router();

// POST /api/ingest - Receive heartbeat data from client snippet
// This endpoint is PUBLIC (no authentication required)
router.post('/', async (req, res) => {
  try {
    const heartbeatData = req.body;

    // Validate required fields
    if (!heartbeatData.siteUrl) {
      return res.status(400).json({ error: 'siteUrl is required' });
    }

    // Log incoming heartbeat (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Heartbeat received:', {
        url: heartbeatData.siteUrl,
        gtm: heartbeatData.gtmPresent,
        ga4: heartbeatData.ga4CollectSeen,
        meta: heartbeatData.metaTrSeen
      });
    }

    // Process heartbeat
    const result = await heartbeatService.ingest(heartbeatData);

    // Return success (minimal response to keep beacon lightweight)
    res.status(200).json({
      success: true,
      heartbeatId: result.id
    });

  } catch (error) {
    console.error('Heartbeat ingestion error:', error);

    // If site not found, return 404
    if (error.message.includes('Site not found')) {
      return res.status(404).json({ error: error.message });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to process heartbeat',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;
