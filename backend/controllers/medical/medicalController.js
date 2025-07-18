import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createMedicationReminder, getMedicationRemindersByUser, updateMedicationReminder } from "../../models/medical/medicalModel.js";
import { v4 as uuidv4 } from 'uuid';

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
        // Using validated body from middleware
        const { medicine_name, reason, dosage, medicine_time, frequency_per_day } = req.validatedBody;

        // Generate unique key for S3
        const imageKey = `medications/${userId}/${uuidv4()}`;

        // Upload image to S3
        await uploadFile(imageFile, imageKey);

        // Create image URL 
        const imageUrl = `/api/s3?key=${imageKey}`;

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

/**
 * @openapi
 * /api/medications/{id}:
 *   put:
 *     tags:
 *       - Medical
 *     summary: Update a medication reminder
 *     description: Updates an existing medication reminder for an authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
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
 *       200:
 *         description: Medication reminder updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Internal server error
 */
export const updateMedication = async (req, res) => {
    try {
        const userId = req.user.id;
        const reminderId = req.params.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        // Fetch the existing reminder 
        const remindersResult = await getMedicationRemindersByUser(userId);
        const reminder = remindersResult.reminders?.find(r => r.id == reminderId);
        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }
        let imageUrl = reminder.image_url;
        if (req.file) {
            // New image uploaded
            const imageKey = `medications/${userId}/${uuidv4()}`;
            await uploadFile(req.file, imageKey);
            imageUrl = `/api/s3?key=${imageKey}`;
        }
        // Using validated body from middleware
        const { medicine_name, reason, dosage, medicine_time, frequency_per_day } = req.validatedBody;
        const updateData = {
            medicationName: medicine_name,
            reason,
            dosage,
            timeToTake: medicine_time,
            frequencyPerDay: frequency_per_day,
            imageUrl
        };
        const result = await updateMedicationReminder(reminderId, updateData);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in updateMedication controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};