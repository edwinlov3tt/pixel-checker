-- Pixel Checker Database Schema

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  name VARCHAR(255),

  -- Expected container/tag IDs
  gtm_container_id VARCHAR(50),
  ga4_measurement_id VARCHAR(50),
  meta_pixel_id VARCHAR(50),

  -- Monitoring settings
  is_active BOOLEAN DEFAULT true,
  check_interval INTEGER DEFAULT 300, -- seconds

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_checked_at TIMESTAMP,

  UNIQUE(org_id, url)
);

-- Heartbeats table (time-series data from client snippets)
CREATE TABLE IF NOT EXISTS heartbeats (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  -- Timestamp
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Detection results
  gtm_present BOOLEAN DEFAULT false,
  gtm_container_id VARCHAR(50),

  ga4_present BOOLEAN DEFAULT false,
  ga4_tag_present BOOLEAN DEFAULT false,
  ga4_collect_seen BOOLEAN DEFAULT false,
  ga4_measurement_id VARCHAR(50),

  meta_pixel_present BOOLEAN DEFAULT false,
  meta_tr_seen BOOLEAN DEFAULT false,
  meta_pixel_id VARCHAR(50),

  -- Consent state
  consent_state JSONB, -- Store full consent object
  consent_granted BOOLEAN,

  -- Page context
  page_url TEXT,
  user_agent TEXT,

  -- Raw payload for debugging
  raw_payload JSONB,

  -- Index for fast queries
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site status table (aggregated current status per site)
CREATE TABLE IF NOT EXISTS site_status (
  id SERIAL PRIMARY KEY,
  site_id INTEGER UNIQUE NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  -- GTM status
  gtm_status VARCHAR(20) DEFAULT 'unknown', -- 'active', 'missing', 'blocked', 'unknown'
  gtm_last_seen TIMESTAMP,
  gtm_container_id VARCHAR(50),

  -- GA4 status
  ga4_status VARCHAR(20) DEFAULT 'unknown',
  ga4_last_seen TIMESTAMP,
  ga4_measurement_id VARCHAR(50),

  -- Meta Pixel status
  meta_status VARCHAR(20) DEFAULT 'unknown',
  meta_last_seen TIMESTAMP,
  meta_pixel_id VARCHAR(50),

  -- Overall health
  overall_status VARCHAR(20) DEFAULT 'unknown', -- 'healthy', 'degraded', 'critical', 'unknown'
  issues_count INTEGER DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Summary stats
  total_heartbeats INTEGER DEFAULT 0,
  last_heartbeat_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_heartbeats_site_id ON heartbeats(site_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_timestamp ON heartbeats(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_heartbeats_site_timestamp ON heartbeats(site_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sites_org_id ON sites(org_id);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_status_updated_at BEFORE UPDATE ON site_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default organization for single-org deployments
INSERT INTO organizations (name) VALUES ('Default Organization')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE heartbeats IS 'Raw time-series data received from client-side snippets';
COMMENT ON TABLE site_status IS 'Aggregated current status for each monitored site';
COMMENT ON COLUMN heartbeats.consent_state IS 'Full consent mode state object from Google Tag Manager';
COMMENT ON COLUMN site_status.overall_status IS 'Computed status: healthy (all green), degraded (some amber), critical (any red), unknown';
