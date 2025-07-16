import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createCommunityEvent, addCommunityEventImage } from "../../models/community/communityEventModel.js";
import { v4 as uuidv4 } from 'uuid';

export const createEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        // validate user
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required', errors: ['User ID is required'] });
        }
        
        const imageFile = req.file;
        // Generate unique key for S3 
        const imageKey = `community-events/${userId}/${uuidv4()}`;
        // Upload image to S3
        await uploadFile(imageFile, imageKey);
        // Create image URL (medical style)
        const imageUrl = `/api/files?key=${imageKey}`;


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