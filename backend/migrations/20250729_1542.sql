-- Alter the CommunityEvent column to allow NULL values
ALTER TABLE CommunityEvent
ALTER COLUMN approved_by_admin_id INT NULL;