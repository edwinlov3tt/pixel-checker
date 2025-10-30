import { query } from '../db/connection.js';

export const siteService = {
  // Get all sites for an organization
  async getAllByOrg(orgId) {
    const result = await query(
      `SELECT s.*, ss.*
       FROM sites s
       LEFT JOIN site_status ss ON s.id = ss.site_id
       WHERE s.org_id = $1
       ORDER BY s.created_at DESC`,
      [orgId]
    );
    return result.rows;
  },

  // Get single site by ID
  async getById(siteId, orgId) {
    const result = await query(
      `SELECT s.*, ss.*
       FROM sites s
       LEFT JOIN site_status ss ON s.id = ss.site_id
       WHERE s.id = $1 AND s.org_id = $2`,
      [siteId, orgId]
    );
    return result.rows[0];
  },

  // Create new site
  async create(siteData) {
    const {
      orgId,
      url,
      name,
      gtmContainerId,
      ga4MeasurementId,
      metaPixelId,
      gtmAccountEmails,
      notificationEmails
    } = siteData;

    const result = await query(
      `INSERT INTO sites (
        org_id, url, name, gtm_container_id, ga4_measurement_id, meta_pixel_id,
        gtm_account_emails, notification_emails
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        orgId,
        url,
        name,
        gtmContainerId,
        ga4MeasurementId,
        metaPixelId,
        gtmAccountEmails || [],
        notificationEmails || []
      ]
    );

    const site = result.rows[0];

    // Create initial site_status record
    await query(
      `INSERT INTO site_status (site_id)
       VALUES ($1)`,
      [site.id]
    );

    return site;
  },

  // Update site
  async update(siteId, orgId, updates) {
    const {
      url,
      name,
      gtmContainerId,
      ga4MeasurementId,
      metaPixelId,
      isActive,
      gtmAccountEmails,
      notificationEmails
    } = updates;

    const result = await query(
      `UPDATE sites
       SET url = COALESCE($3, url),
           name = COALESCE($4, name),
           gtm_container_id = COALESCE($5, gtm_container_id),
           ga4_measurement_id = COALESCE($6, ga4_measurement_id),
           meta_pixel_id = COALESCE($7, meta_pixel_id),
           is_active = COALESCE($8, is_active),
           gtm_account_emails = COALESCE($9, gtm_account_emails),
           notification_emails = COALESCE($10, notification_emails)
       WHERE id = $1 AND org_id = $2
       RETURNING *`,
      [
        siteId,
        orgId,
        url,
        name,
        gtmContainerId,
        ga4MeasurementId,
        metaPixelId,
        isActive,
        gtmAccountEmails,
        notificationEmails
      ]
    );

    return result.rows[0];
  },

  // Delete site
  async delete(siteId, orgId) {
    const result = await query(
      `DELETE FROM sites
       WHERE id = $1 AND org_id = $2
       RETURNING *`,
      [siteId, orgId]
    );

    return result.rows[0];
  },

  // Get site status
  async getStatus(siteId, orgId) {
    const result = await query(
      `SELECT ss.*
       FROM site_status ss
       INNER JOIN sites s ON ss.site_id = s.id
       WHERE ss.site_id = $1 AND s.org_id = $2`,
      [siteId, orgId]
    );

    return result.rows[0];
  },

  // Get recent heartbeats for a site
  async getRecentHeartbeats(siteId, orgId, limit = 50) {
    const result = await query(
      `SELECT h.*
       FROM heartbeats h
       INNER JOIN sites s ON h.site_id = s.id
       WHERE h.site_id = $1 AND s.org_id = $2
       ORDER BY h.timestamp DESC
       LIMIT $3`,
      [siteId, orgId, limit]
    );

    return result.rows;
  }
};
