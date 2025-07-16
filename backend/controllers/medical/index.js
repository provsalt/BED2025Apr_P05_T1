import { Router } from "express";
import { createMedication, getMedicationReminders } from "./medicalController.js";
import {genericUploadMiddleware} from "../../middleware/upload.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateMedical } from "../../middleware/validateMedical.js";
import { medicationSchema } from "../../utils/validation/medical.js";

const router = Router();

// POST /api/medications - Create medication reminder
router.post("/", getUserMiddleware, genericUploadMiddleware.single("image"), validateMedical(medicationSchema), createMedication);

// GET /api/medications - get medication reminders for the user
router.get("/", getUserMiddleware, getMedicationReminders);

export default router; 