import { query, transaction } from '../db/connection.js';

export const heartbeatService = {
  // Process incoming heartbeat from client snippet
  async ingest(heartbeatData) {
    const {
      siteUrl,
      gtmPresent,
      gtmContainerId,
      ga4Present,
      ga4TagPresent,
      ga4CollectSeen,
      ga4MeasurementId,
      metaPixelPresent,
      metaTrSeen,
      metaPixelId,
      consentState,
      consentGranted,
      pageUrl,
      userAgent
    } = heartbeatData;

    return await transaction(async (client) => {
      // Find site by URL
      const siteResult = await client.query(
        'SELECT id, org_id FROM sites WHERE url = $1',
        [siteUrl]
      );

      if (siteResult.rows.length === 0) {
        throw new Error(`Site not found: ${siteUrl}`);
      }

      const site = siteResult.rows[0];

      // Insert heartbeat record
      const heartbeatResult = await client.query(
        `INSERT INTO heartbeats (
          site_id,
          gtm_present,
          gtm_container_id,
          ga4_present,
          ga4_tag_present,
          ga4_collect_seen,
          ga4_measurement_id,
          meta_pixel_present,
          meta_tr_seen,
          meta_pixel_id,
          consent_state,
          consent_granted,
          page_url,
          user_agent,
          raw_payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          site.id,
          gtmPresent,
          gtmContainerId,
          ga4Present,
          ga4TagPresent,
          ga4CollectSeen,
          ga4MeasurementId,
          metaPixelPresent,
          metaTrSeen,
          metaPixelId,
          JSON.stringify(consentState),
          consentGranted,
          pageUrl,
          userAgent,
          JSON.stringify(heartbeatData)
        ]
      );

      // Update site_status with latest information
      await this.updateSiteStatus(client, site.id, heartbeatData);

      return heartbeatResult.rows[0];
    });
  },

  // Update aggregated site status based on heartbeat
  async updateSiteStatus(client, siteId, heartbeatData) {
    const {
      gtmPresent,
      gtmContainerId,
      ga4CollectSeen,
      ga4MeasurementId,
      metaTrSeen,
      metaPixelId,
      consentGranted
    } = heartbeatData;

    // Determine status for each pixel type
    const gtmStatus = gtmPresent ? 'active' : 'missing';
    const ga4Status = ga4CollectSeen
      ? 'active'
      : (consentGranted === false ? 'blocked' : 'missing');
    const metaStatus = metaTrSeen
      ? 'active'
      : (consentGranted === false ? 'blocked' : 'missing');

    // Calculate overall status
    const statuses = [gtmStatus, ga4Status, metaStatus];
    let overallStatus = 'healthy';
    let issuesCount = 0;

    if (statuses.includes('missing')) {
      issuesCount = statuses.filter(s => s === 'missing').length;
      overallStatus = issuesCount >= 2 ? 'critical' : 'degraded';
    } else if (statuses.includes('blocked')) {
      issuesCount = statuses.filter(s => s === 'blocked').length;
      overallStatus = 'degraded';
    }

    // Update or insert site_status
    await client.query(
      `INSERT INTO site_status (
        site_id,
        gtm_status,
        gtm_last_seen,
        gtm_container_id,
        ga4_status,
        ga4_last_seen,
        ga4_measurement_id,
        meta_status,
        meta_last_seen,
        meta_pixel_id,
        overall_status,
        issues_count,
        total_heartbeats,
        last_heartbeat_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (site_id) DO UPDATE SET
        gtm_status = EXCLUDED.gtm_status,
        gtm_last_seen = CASE WHEN $2 = 'active' THEN CURRENT_TIMESTAMP ELSE site_status.gtm_last_seen END,
        gtm_container_id = COALESCE(EXCLUDED.gtm_container_id, site_status.gtm_container_id),
        ga4_status = EXCLUDED.ga4_status,
        ga4_last_seen = CASE WHEN $5 = 'active' THEN CURRENT_TIMESTAMP ELSE site_status.ga4_last_seen END,
        ga4_measurement_id = COALESCE(EXCLUDED.ga4_measurement_id, site_status.ga4_measurement_id),
        meta_status = EXCLUDED.meta_status,
        meta_last_seen = CASE WHEN $8 = 'active' THEN CURRENT_TIMESTAMP ELSE site_status.meta_last_seen END,
        meta_pixel_id = COALESCE(EXCLUDED.meta_pixel_id, site_status.meta_pixel_id),
        overall_status = EXCLUDED.overall_status,
        issues_count = EXCLUDED.issues_count,
        total_heartbeats = site_status.total_heartbeats + 1,
        last_heartbeat_at = CURRENT_TIMESTAMP`,
      [
        siteId,
        gtmStatus,
        gtmPresent ? new Date() : null,
        gtmContainerId,
        ga4Status,
        ga4CollectSeen ? new Date() : null,
        ga4MeasurementId,
        metaStatus,
        metaTrSeen ? new Date() : null,
        metaPixelId,
        overallStatus,
        issuesCount
      ]
    );
  }
};
