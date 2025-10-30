import express from 'express';
import { siteService } from '../services/siteService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/sites - Get all sites for user's organization
router.get('/', async (req, res) => {
  try {
    const sites = await siteService.getAllByOrg(req.user.orgId);
    res.json({ sites });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// GET /api/sites/:id - Get single site
router.get('/:id', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const site = await siteService.getById(siteId, req.user.orgId);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({ site });
  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

// POST /api/sites - Create new site
router.post('/', async (req, res) => {
  try {
    const { url, name, gtmContainerId, ga4MeasurementId, metaPixelId, gtmAccountEmails, notificationEmails } = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Create site
    const site = await siteService.create({
      orgId: req.user.orgId,
      url,
      name: name || url,
      gtmContainerId,
      ga4MeasurementId,
      metaPixelId,
      gtmAccountEmails,
      notificationEmails
    });

    res.status(201).json({
      message: 'Site created successfully',
      site
    });

  } catch (error) {
    console.error('Create site error:', error);

    if (error.message.includes('duplicate') || error.code === '23505') {
      return res.status(409).json({ error: 'Site with this URL already exists' });
    }

    res.status(500).json({ error: 'Failed to create site' });
  }
});

// PUT /api/sites/:id - Update site
router.put('/:id', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const updates = req.body;

    const site = await siteService.update(siteId, req.user.orgId, updates);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({
      message: 'Site updated successfully',
      site
    });

  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// DELETE /api/sites/:id - Delete site
router.delete('/:id', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const site = await siteService.delete(siteId, req.user.orgId);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({
      message: 'Site deleted successfully',
      site
    });

  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// GET /api/sites/:id/status - Get site status
router.get('/:id/status', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const status = await siteService.getStatus(siteId, req.user.orgId);

    if (!status) {
      return res.status(404).json({ error: 'Site status not found' });
    }

    res.json({ status });

  } catch (error) {
    console.error('Get site status error:', error);
    res.status(500).json({ error: 'Failed to fetch site status' });
  }
});

// GET /api/sites/:id/heartbeats - Get recent heartbeats
router.get('/:id/heartbeats', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 50;

    const heartbeats = await siteService.getRecentHeartbeats(siteId, req.user.orgId, limit);

    res.json({ heartbeats });

  } catch (error) {
    console.error('Get heartbeats error:', error);
    res.status(500).json({ error: 'Failed to fetch heartbeats' });
  }
});

export default router;
