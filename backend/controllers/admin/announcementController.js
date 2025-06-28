import { createAnnouncement, getAllAnnouncements } from "../Models/announcement.js";

// Admin creates an announcement
export const createAnnouncementController = async (req, res) => {
  const { title, content } = req.body;
  const createdBy = req.user?.id; // assumes req.user is set by auth middleware
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  try {
    await createAnnouncement(title, content, createdBy);
    res.status(201).json({ message: "Announcement created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
};

// Get all announcements
export const getAllAnnouncementsController = async (req, res) => {
  try {
    const announcements = await getAllAnnouncements();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

