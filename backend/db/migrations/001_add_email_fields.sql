-- Migration: Add GTM account emails and notification emails to sites table

-- Add new columns to sites table
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS gtm_account_emails TEXT[], -- Array of GTM account emails
ADD COLUMN IF NOT EXISTS notification_emails TEXT[]; -- Array of emails to notify on pixel issues

-- Add comments for documentation
COMMENT ON COLUMN sites.gtm_account_emails IS 'Email addresses associated with GTM accounts for accessing containers';
COMMENT ON COLUMN sites.notification_emails IS 'Email addresses to notify when pixels are not detected';
