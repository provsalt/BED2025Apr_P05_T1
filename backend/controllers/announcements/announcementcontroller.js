
import {createAnnouncement, getAnnouncements, getAnnouncementById, deleteAnnouncement} from "../../models/admin/adminAnnouncement.js";
import {z} from "zod/v4";
import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { ErrorFactory } from "../../utils/AppError.js";

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
export const createAnnouncementController = async (req, res, next) => {
  try {
    const validate = announcementSchema.safeParse(req.body);
    if (!validate.success) {
      throw ErrorFactory.validation("Invalid announcement data");
    }

    const announcementData = {
      ...validate.data,
      user_id: req.user.id
    };
    
    const announcement = await createAnnouncement(announcementData);
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
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
export const getAnnouncementsController = async (req, res, next) => {
  try {
    const announcements = await getAnnouncements();
    res.status(200).json(announcements);
  } catch (error) {
    next(error);
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
export const getAnnouncementByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      throw ErrorFactory.validation("Invalid announcement ID");
    }

    const announcement = await getAnnouncementById(parseInt(id));
    if (!announcement) {
      throw ErrorFactory.notFound("Announcement");
    }
    res.status(200).json(announcement);
  } catch (error) {
    next(error);
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
export const deleteAnnouncementController = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      throw ErrorFactory.validation("Invalid announcement ID");
    }

    await deleteAnnouncement(parseInt(id));
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) {
      return next(ErrorFactory.notFound("Announcement"));
    }
    next(error);
  }
};
