import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createMedicationReminder, getMedicationRemindersByUser } from "../../models/medical/medicalModel.js";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// CREATE medication reminder
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

// GET  medication reminders for user
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