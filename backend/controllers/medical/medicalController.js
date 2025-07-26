import { uploadFile, deleteFile } from "../../services/s3Service.js";
import { createMedicationReminder, getMedicationRemindersByUser, updateMedicationReminder, deleteMedicationReminder, createMedicationQuestion } from "../../models/medical/medicalModel.js";
import { MAX_REMINDERS_PER_USER } from "../../utils/validation/medical.js";
import { v4 as uuidv4 } from 'uuid';
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/medications:
 *   post:
 *     tags:
 *       - Medical
 *     summary: Create a new medication reminder
 *     description: 
 *       Creates a new medication reminder for a user, including an image of the medication.
 *       - You may have up to 3 medication reminders per user.
 *       - Each reminder can have a frequency per day of up to 3. (every 4 hours)
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
 *                 minimum: 1
 *                 maximum: 3
 *                 description: Maximum frequency of 3 per reminder (every 4 hours)
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Medication reminder created successfully
 *       400:
 *         description: 
 *           - All fields including image are required
 *           - You can only have up to 3 medication reminders
 *           - Frequency per day cannot exceed 3
 *       500:
 *         description: Internal server error
 */
export const createMedication = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        if (!userId) {
            throw ErrorFactory.unauthorized("User not authenticated");
        }
        
        if (!req.file) {
            throw ErrorFactory.validation("Image file is required");
        }
        
        const { medicine_name, reason, dosage, medicine_time, frequency_per_day } = req.body;
        
        if (!medicine_name || !reason || !dosage || !medicine_time || !frequency_per_day) {
            throw ErrorFactory.validation("All fields (medicine_name, reason, dosage, medicine_time, frequency_per_day) are required");
        }
        
        if (frequency_per_day > 3 || frequency_per_day < 1) {
            throw ErrorFactory.validation("Frequency per day must be between 1 and 3");
        }
        
        // Check max reminders per user
        const remindersResult = await getMedicationRemindersByUser(userId);
        if (remindersResult.success && remindersResult.reminders.length >= MAX_REMINDERS_PER_USER) {
            throw ErrorFactory.validation(`You can only have up to ${MAX_REMINDERS_PER_USER} medication reminders`);
        }
        
        const imageFile = req.file;
        
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
            throw ErrorFactory.database("Failed to create medication reminder", result.message);
        }
    } catch (error) {
        next(error);
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
export const getMedicationReminders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        if (!userId) {
            throw ErrorFactory.unauthorized("User not authenticated");
        }
        
        const result = await getMedicationRemindersByUser(userId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            throw ErrorFactory.database("Failed to retrieve medication reminders", result.message);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/medications/{id}:
 *   put:
 *     tags:
 *       - Medical
 *     summary: Update a medication reminder
 *     description: 
 *       Updates an existing medication reminder for an authenticated user.
 *       - Each reminder can have a frequency per day of up to 3 (every 4 hours).
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
 *                 minimum: 1
 *                 maximum: 3
 *                 description: Maximum frequency of 3 per reminder (every 4 hours)
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Medication reminder updated successfully
 *       400:
 *         description: 
 *           - Bad request
 *           - Frequency per day cannot exceed 3
 *       404:
 *         description: Reminder not found
 *       500:
 *         description: Internal server error
 */
export const updateMedication = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reminderId = req.params.id;
        
        if (!userId) {
            throw ErrorFactory.unauthorized("User not authenticated");
        }
        
        if (!reminderId || isNaN(reminderId)) {
            throw ErrorFactory.validation("Valid reminder ID is required");
        }
        
        const { medicine_name, reason, dosage, medicine_time, frequency_per_day } = req.body;
        
        if (frequency_per_day && (frequency_per_day > 3 || frequency_per_day < 1)) {
            throw ErrorFactory.validation("Frequency per day must be between 1 and 3");
        }
        
        // Fetch the existing reminder 
        const remindersResult = await getMedicationRemindersByUser(userId);
        const reminder = remindersResult.reminders?.find(r => r.id == reminderId);
        if (!reminder) {
            throw ErrorFactory.notFound("Medication reminder");
        }
        
        let imageUrl = reminder.image_url;
        if (req.file) {
            // New image uploaded
            const imageKey = `medications/${userId}/${uuidv4()}`;
            await uploadFile(req.file, imageKey);
            imageUrl = `/api/s3?key=${imageKey}`;
        }
        
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
            throw ErrorFactory.database("Failed to update medication reminder", result.message);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/medications/{id}:
 *   delete:
 *     tags:
 *       - Medical
 *     summary: Delete a medication reminder
 *     description: Deletes a medication reminder by ID for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the medication reminder to delete
 *     responses:
 *       200:
 *         description: Medication reminder deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: User ID or reminder ID is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Medication reminder not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
export const deleteMedication = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reminderId = parseInt(req.params.id, 10);
        
        if (!userId) {
            throw ErrorFactory.unauthorized("User not authenticated");
        }
        
        if (!reminderId || isNaN(reminderId) || reminderId <= 0) {
            throw ErrorFactory.validation("Valid reminder ID is required");
        }
        
        const result = await deleteMedicationReminder(reminderId, userId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            throw ErrorFactory.notFound("Medication reminder");
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/medications/questionnaire:
 *   post:
 *     tags:
 *       - Medical
 *     summary: Submit medication questionnaire
 *     description: Submits a medication questionnaire for the authenticated user. 
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty_walking:
 *                 type: string
 *                 description: Difficulty walking
 *               assistive_device:
 *                 type: string
 *                 description: Assistive device used
 *               symptoms_or_pain:
 *                 type: string
 *                 description: Symptoms or pain
 *               allergies:
 *                 type: string
 *                 description: Allergies
 *               medical_conditions:
 *                 type: string
 *                 description: Medical conditions
 *               exercise_frequency:
 *                 type: string
 *                 description: Exercise frequency
 *     responses:
 *       200:
 *         description: Questionnaire submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
export const submitMedicationQuestionnaire = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
        throw ErrorFactory.unauthorized("User not authenticated");
    }
    
    const data = req.body;
    const { difficulty_walking, assistive_device, symptoms_or_pain, allergies, medical_conditions, exercise_frequency } = data;
    
    if (!difficulty_walking || !assistive_device || !symptoms_or_pain || !allergies || !medical_conditions || !exercise_frequency) {
        throw ErrorFactory.validation("All questionnaire fields are required");
    }
    
    const result = await createMedicationQuestion(userId, data);
    if (result.success) {
      res.status(200).json({ success: true, message: "Questionnaire submitted" });
    } else {
      throw ErrorFactory.database("Failed to submit questionnaire", result.message);
    }
  } catch (error) {
    next(error);
  }
};