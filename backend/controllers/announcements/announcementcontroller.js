
import {createAnnouncement, getAnnouncements, getAnnouncementById, deleteAnnouncement} from "../../models/admin/adminAnnouncement.js";
import {z} from "zod/v4";
import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";

// Validation schema for announcement data
const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters")
});

/**
 * Create a new announcement
 */
export const createAnnouncementController = async (req, res) => {
  const validate = announcementSchema.safeParse(req.body);
  if (!validate.success) {
    return res.status(400).json({ error: "Invalid announcement data", details: validate.error.issues });
  }

  try {
    const announcementData = {
      ...validate.data,
      user_id: req.user.id
    };
    
    const announcement = await createAnnouncement(announcementData);
    res.status(201).json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Error creating announcement" });
  }
};

/**
 * Get all announcements
 */
export const getAnnouncementsController = async (req, res) => {
  try {
    const announcements = await getAnnouncements();
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Error fetching announcements" });
  }
};

/**
 * Get announcement by ID
 */
export const getAnnouncementByIdController = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid announcement ID" });
  }

  try {
    const announcement = await getAnnouncementById(parseInt(id));
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.status(200).json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ error: "Error fetching announcement" });
  }
};

/**
 * Delete an announcement
 */
export const deleteAnnouncementController = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid announcement ID" });
  }

  try {
    await deleteAnnouncement(parseInt(id));
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.status(500).json({ error: "Error deleting announcement" });
  }
};
