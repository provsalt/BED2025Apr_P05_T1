import {createAnnouncement, getAnnouncements, getAnnouncementById, deleteAnnouncement} from "../../models/admin/adminAnnouncement.js";
import {z} from "zod/v4";

// Validation schema for announcement data
const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters")
});

/**
 * @openapi
 * /api/announcements:
 *   post:
 *     tags:
 *       - Announcements
 *     summary: Create a new announcement
 *     description: Creates a new announcement. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Invalid announcement data
 *       500:
 *         description: Error creating announcement
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
 * @openapi
 * /api/announcements:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get all announcements
 *     description: Retrieves a list of all announcements. This is a public route.
 *     responses:
 *       200:
 *         description: A list of announcements
 *       500:
 *         description: Error fetching announcements
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
 * @openapi
 * /api/announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get an announcement by ID
 *     description: Retrieves a single announcement by its ID. This is a public route.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the announcement to retrieve.
 *     responses:
 *       200:
 *         description: The announcement
 *       400:
 *         description: Invalid announcement ID
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Error fetching announcement
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
 * @openapi
 * /api/announcements/{id}:
 *   delete:
 *     tags:
 *       - Announcements
 *     summary: Delete an announcement
 *     description: Deletes an announcement by its ID. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the announcement to delete.
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       400:
 *         description: Invalid announcement ID
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Error deleting announcement
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
