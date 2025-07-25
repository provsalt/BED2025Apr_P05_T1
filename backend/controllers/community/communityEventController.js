import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createCommunityEvent, addCommunityEventImage } from "../../models/community/communityEventModel.js";
import { v4 as uuidv4 } from 'uuid';
import { getUpcomingEventsByUser } from "../../models/community/communityEventModel.js";

/**
 * @openapi
 * /api/community/create:
 *   post:
 *     tags:
 *       - Community
 *     summary: Create a new community event
 *     description: Allows a user to create a new community event with an image.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Event name
 *               location:
 *                 type: string
 *                 description: Event location
 *               category:
 *                 type: string
 *                 enum: [sports, arts, culinary, learn]
 *                 description: Event category
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Event date (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 description: Event time (HH:mm or HH:mm:ss)
 *               description:
 *                 type: string
 *                 description: Event description
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Event image (JPEG, PNG, WEBP, JPG)
 *     responses:
 *       201:
 *         description: Community event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 eventId:
 *                   type: integer
 *                 imageUrl:
 *                   type: string
 *                   description: URL to access the uploaded image (e.g. /api/s3?key=community-events/{userId}/{uuid})
 *       400:
 *         description: Bad request (validation or missing fields)
 *       500:
 *         description: Internal server error
 */
export const createEvent = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }
        const userId = req.user.id;
        // validate user
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required', errors: ['User ID is required'] });
        }

        // Use validated body from middleware
        let { time, ...rest } = req.validatedBody;
        // Robustly ensure time is in HH:mm:ss format
        if (time) {
            if (/^\d{2}:\d{2}$/.test(time)) {
                time = time + ":00";
            } else if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
                // Already in HH:mm:ss format, do nothing
            } else {
                return res.status(400).json({ success: false, message: 'Invalid time format. Please use HH:mm or HH:mm:ss.' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Time is required.' });
        }

        const imageFile = req.file;
        // Generate unique key for S3 
        const imageKey = `community-events/${userId}/${uuidv4()}`;
        // Upload image to S3
        await uploadFile(imageFile, imageKey);
        // Create image URL (medical style)
        const imageUrl = `/api/s3?key=${imageKey}`;

        const eventData = {
            ...rest,
            time,
            user_id: userId,
            approved_by_admin_id: 1 // For testing, set to admin ID 1 (to be removed when admin approval is done)
        };
        // Save to database
        const eventResult = await createCommunityEvent(eventData);
        if (!eventResult.success) {
            // If database fails, cleanup uploaded image
            await deleteFile(imageKey);
            return res.status(500).json(eventResult);
        }
        // Save image to database
        const imageResult = await addCommunityEventImage(eventResult.eventId, imageUrl);
        if (!imageResult.success) {
            await deleteFile(imageKey);
            return res.status(500).json(imageResult);
        }
        return res.status(201).json({
            success: true,
            message: 'Community event created successfully',
            eventId: eventResult.eventId,
            imageUrl
        });
    } catch (error) {
        console.error('Error in createEvent controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}; 

/**
 * @openapi
 * /api/community/events:
 *   get:
 *     summary: Get upcoming community events for the authenticated user
 *     tags:
 *       - Community
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *                       category:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       time:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image_url:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
export const getUpcomingEvents = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }
        const userId = req.user.id;
        const events = await getUpcomingEventsByUser(userId);
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming events', error: error.message });
    }
}; 