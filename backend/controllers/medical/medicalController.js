import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createMedicationReminder, } from "../../models/medical/medicalModel.js";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// CREATE medication reminder
export const createMedication = async (req, res) => {
    try {
        console.log('DEBUG medicine_time:', req.body.medicine_time, typeof req.body.medicine_time);
        const { user_id, medicine_name, reason, dosage, medicine_time, frequency_per_day } = req.body;
        const imageFile = req.file;

        // Validate required fields
        if (!user_id || !medicine_name || !reason || !dosage || !medicine_time || !frequency_per_day || !imageFile) {
            return res.status(400).json({
                success: false,
                message: 'All fields including image are required'
            });
        }

        // Generate unique key for S3
        const fileExtension = path.extname(imageFile.originalname);
        const imageKey = `medications/${user_id}/${uuidv4()}${fileExtension}`;

        // Upload image to S3
        await uploadFile(imageFile, imageKey);

        // Create image URL (adjust based on your setup)
        const imageUrl = `/api/files?key=${imageKey}`;

        // Prepare data for model
        const medicationData = {
            userId: parseInt(user_id),
            medicationName: medicine_name,
            reason,
            dosage,
            timeToTake: medicine_time,
            frequencyPerDay: parseInt(frequency_per_day),
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