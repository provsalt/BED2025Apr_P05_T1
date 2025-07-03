import {createAnnouncement, getAnnouncements} from "../../models/admin/adminAnnouncement.js";
import {authorizeRole} from "../../middleware/authorizeRole.js";

/**
 * Admin controller for handling admin-related operations.
 * This includes creating and retrieving announcements.
 * @param app {import("express").Application} - The Express application instance.
 */
export const AdminController = (app) => {
  // Middleware to check if user is authenticated and has admin role
  app.use("/api/admin/*", authorizeRole(['Admin']));

  // Route to create an announcement
  app.post("/api/admin/announcement", async (req, res) => {
    try {
      const announcementData = req.body;
      const announcement = await createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({message: "Internal server error"});
    }
  });

  // Route to get all announcements
  app.get("/api/admin/announcements", async (req, res) => {
    try {
      const announcements = await getAnnouncements();
      res.status(200).json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({message: "Internal server error"});
    }
  });
}