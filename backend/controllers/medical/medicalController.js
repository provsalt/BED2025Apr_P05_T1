import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createMedicationReminder, getMedicationRemindersByUser } from "../../models/medical/medicalModel.js";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * @openapi
 * /api/medications:
 *   post:
 *     tags:
 *       - Medical
 *     summary: Create a new medication reminder
 *     description: Creates a new medication reminder for a user, including an image of the medication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               medicine_name:
 *                 type: string
 *               reason:
 *                 type: string
 *               dosage:
 *                 type: string
 *               medicine_time:
 *                 type: string
 *                 format: time
 *               frequency_per_day:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Medication reminder created successfully
 *       400:
 *         description: All fields including image are required
 *       500:
 *         description: Internal server error
 */
export const createMedication = async (req, res) => {
    try {
        const userId = req.user.id;
        // validate user
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const imageFile = req.file;
        const { medicine_name, reason, dosage, medicine_time, frequency_per_day } = req.validatedBody;

        // validate image
        if (!imageFile) {
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        // Generate unique key for S3
        const imageKey = `medications/${userId}/${uuidv4()}`;

        // Upload image to S3
        await uploadFile(imageFile, imageKey);

        // Create image URL (adjust based on your setup)
        const imageUrl = `/api/files?key=${imageKey}`;

        // Prepare data for model
        const medicationData = {
            userId,
            medicationName: medicine_name,
            reason,
            dosage,
            timeToTake: medicine_time,
            frequencyPerDay: frequency_per_day,
            imageUrl
        };

        // Save to database
        const result = await createMedicationReminder(medicationData);

        if (result.success) {
            res.status(201).json(result);
        } else {
            // If database fails, cleanup uploaded image
            await deleteFile(imageKey);
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in createMedication controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * @openapi
 * /api/medications:
 *   get:
 *     tags:
 *       - Medical
 *     summary: Get medication reminders for a user
 *     description: Retrieves all medication reminders for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of medication reminders
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Internal server error
 */
export const getMedicationReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const result = await getMedicationRemindersByUser(userId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in getMedicationReminders controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};