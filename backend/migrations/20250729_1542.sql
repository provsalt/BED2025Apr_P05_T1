-- Alter the CommunityEvent column to allow NULL values
ALTER TABLE CommunityEvent
ALTER COLUMN approved_by_admin_id INT NULL;

-- Recreate the foreign key constraint with CASCADE DELETE
ALTER TABLE CommunityEventImage
ADD CONSTRAINT FK_CommunityEventImage_CommunityEvent
FOREIGN KEY (community_event_id) 
REFERENCES CommunityEvent(id) 
ON DELETE CASCADE;