-- Updates Announcement table structure

-- First, let's add an image column if you want to support images
ALTER TABLE Announcement 
ADD image_url VARCHAR(255) NULL;

-- You might also want to add a status column for draft/published announcements
ALTER TABLE Announcement 
ADD status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- Add an index for better performance
CREATE INDEX IX_Announcement_Created_At ON Announcement(created_at DESC);
CREATE INDEX IX_Announcement_User_Id ON Announcement(user_id);
CREATE INDEX IX_Announcement_Status ON Announcement(status);
