import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createCommunityEvent, addCommunityEventImage, getAllApprovedEvents, getCommunityEventsByUserId, getCommunityEventById, updateCommunityEvent, deleteUnwantedImages, getCommunityEventImages } from "../../models/community/communityEventModel.js";
import { v4 as uuidv4 } from 'uuid';
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/community/create:
 *   post:
 *     tags:
 *       - Community
 *     summary: Create a new community event
 *     description: Allows a user to create a new community event with multiple images. The first image uploaded will be used as the cover image.
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
 *                 description: Event time (HH:mm or HH:mm:ss format)
 *               description:
 *                 type: string
 *                 description: Event description
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 
 *                  - Event images (JPEG, PNG, WEBP, JPG up to 30MB each). 
 *                  - Multiple images supported.  
 *                  - Filenames are automatically sanitized.
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
 *                   description: ID of the created event
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of URLs to access the uploaded images
 *       400:
 *         description: Bad request (validation or missing fields)
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
export const createEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one image is required.' });
        }

        // Ensure time is in HH:mm:ss format t match db
        let { time, ...rest } = req.body;
        if (time && /^\d{2}:\d{2}$/.test(time)) {
            time = time + ":00";
        }
        
        const eventData = {
            ...rest,
            time,
            user_id: userId,
            approved_by_admin_id: 1 // For testing, set to admin ID 1 (to be removed when admin approval is done)
        };
        const eventResult = await createCommunityEvent(eventData);
        if (!eventResult.success) {
            return res.status(500).json(eventResult);
        }

        // Handle multiple images 
        const imageUrls = [];
        for (let file of files) {
            // Sanitize filename to avoid encoding issues
            const sanitizedFilename = file.originalname
                .replace(/[^\w.-]/g, '_') // Replace special characters with underscore
                .replace(/_+/g, '_') // Replace multiple underscores with single
                .substring(0, 100); // Limit length
            
            const imageKey = `community-events/${userId}/${uuidv4()}_${sanitizedFilename}`;

            try {
                await uploadFile(file, imageKey);
                const imageUrl = `/api/s3?key=${imageKey}`;
                const imageResult = await addCommunityEventImage(eventResult.eventId, imageUrl);
                if (imageResult.success) {
                    imageUrls.push(imageUrl);
                }
            } catch (error) {
                console.error('Error processing file:', file.originalname, error);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Community event created successfully',
            eventId: eventResult.eventId,
            images: imageUrls
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
 * /api/community:
 *   get:
 *     tags:
 *       - Community
 *     summary: Get all approved community events
 *     description: Returns all approved community events, sorted by date and time.
 *     responses:
 *       200:
 *         description: List of approved community events
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
 *                       created_by_name:
 *                         type: string
 *                       image_url:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
export const getApprovedEvents = async (req, res) => {
  try {
    const result = await getAllApprovedEvents();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}; 

/**
 * @openapi
 * /api/community/mine:
 *   get:
 *     tags:
 *       - Community
 *     summary: Get all community events created by the authenticated user
 *     description: Returns all community events created by the current user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's community events
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
 *       400:
 *         description: User ID is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getMyEvents = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
        }
        const userId = req.user.id;
        // validate user
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required'});
        }

        const result = await getCommunityEventsByUserId(userId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in getMyEvents controller:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}; 

/**
 * @openapi
 * /api/community/{id}:
 *   get:
 *     tags:
 *       - Community
 *     summary: Get a single community event by ID
 *     description: Returns all details for a single approved community event including all uploaded images.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 event:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                     category:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     time:
 *                       type: string
 *                     description:
 *                       type: string
 *                     created_by_name:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           image_url:
 *                             type: string
 *                           uploaded_at:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
export const getEventById = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }
    const result = await getCommunityEventById(eventId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * @openapi
 * /api/community/{id}:
 *   put:
 *     tags:
 *       - Community
 *     summary: Update a community event
 *     description: Allows a user to update their own community event. The event must belong to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The event ID to update
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
 *                 description: Event time (HH:mm or HH:mm:ss format)
 *               description:
 *                 type: string
 *                 description: Event description
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 
 *                  - New event images (JPEG, PNG, WEBP, JPG up to 30MB each). 
 *                  - Multiple images supported.  
 *                  - Filenames are automatically sanitized.
 *                  - if not provided, existing images remain unchanged.
 *               keepImageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 
 *                  - Array of existing image IDs to keep.
 *                  - Images not in this list will be deleted.
 *                  - if not provided, all existing images are kept.
 *     responses:
 *       200:
 *         description: Community event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 newImages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of URLs to access the newly uploaded images
 *                 deletedImages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of URLs of images that were deleted
 *       400:
 *         description: Bad request (validation or missing fields)
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to edit this event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
export const updateEvent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const eventId = parseInt(req.params.id, 10);
        
        if (!eventId || isNaN(eventId)) {
            throw ErrorFactory.validation("Invalid event ID");
        }

        // Ensure time is in HH:mm:ss format to match db
        let { time, keepImageIds, ...rest } = req.body;
        if (time && /^\d{2}:\d{2}$/.test(time)) {
            time = time + ":00";
        }
        
        const eventData = {
            ...rest,
            time
        };

        // Update the event
        const updateResult = await updateCommunityEvent(eventId, eventData, userId);
        if (!updateResult.success) {
            if (updateResult.message.includes('not found') || updateResult.message.includes('permission')) {
                throw ErrorFactory.forbidden("You do not have permission to edit this event");
            }
            throw ErrorFactory.database("Failed to update community event", updateResult.message);
        }

        // Handle image management
        const files = req.files || [];
        const newImageUrls = [];
        const deletedImageUrls = [];

        // Delete images that are not in keepImageIds 
        if (keepImageIds) {
            try {
                let keepIds;
                if (typeof keepImageIds === 'string') {
                    try{
                        keepIds = JSON.parse(keepImageIds);
                    }catch (parseError) {
                        throw ErrorFactory.validation("Invalid keepImageIds format");
                    }
                } else if (Array.isArray(keepImageIds)) {
                    keepIds = keepImageIds;
                } else {
                    keepIds = [keepImageIds];
                }
                const deleteResult = await deleteUnwantedImages(eventId, userId, keepIds);
                if (deleteResult.success) {
                    // Delete files from S3 for each deleted URL
                    for (const imageUrl of deleteResult.deletedUrls) {
                        try {
                            // Extract the key from the image URL
                            const keyMatch = imageUrl.match(/\/api\/s3\?key=(.+)/);
                            if (keyMatch) {
                                const key = decodeURIComponent(keyMatch[1]);
                                await deleteFile(key);
                            }
                        } catch (s3Error) {
                            console.error('Error deleting file from S3:', imageUrl, s3Error);
                        }
                    }
                    deletedImageUrls.push(...deleteResult.deletedUrls);
                }
            } catch (error) {
                throw ErrorFactory.database("Failed to delete unwanted images", error.message);
            }
        }

        // Handle new images if provided
        if (files.length > 0) {
            for (let file of files) {
                // Sanitize filename to avoid encoding issues
                const sanitizedFilename = file.originalname
                    .replace(/[^\w.-]/g, '_') // Replace special characters with underscore
                    .replace(/_+/g, '_') // Replace multiple underscores with single
                    .substring(0, 100); // Limit length
                
                const imageKey = `community-events/${userId}/${uuidv4()}_${sanitizedFilename}`;

                try {
                    await uploadFile(file, imageKey);
                    const imageUrl = `/api/s3?key=${imageKey}`;
                    const imageResult = await addCommunityEventImage(eventId, imageUrl);
                    if (imageResult.success) {
                        newImageUrls.push(imageUrl);
                    }
                } catch (error) {
                    throw ErrorFactory.database("Failed to process uploaded file", error.message);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Community event updated successfully',
            newImages: newImageUrls,
            deletedImages: deletedImageUrls
        });
    } catch (error) {
        next(error);
    }
};


