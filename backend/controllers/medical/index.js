import { Router } from "express";
import { createMedication, getMedicationReminders } from "./medicalController.js";
import { createUploadMiddleware } from "../../middleware/upload.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateMedical } from "../../middleware/validateMedical.js";
import { validateImageType } from "../../middleware/validateImage.js";
import { medicationSchema } from "../../utils/validation/medical.js";

const router = Router();

// POST /api/medications - Create medication reminder
router.post("/", getUserMiddleware, createUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  fileSize: 5 * 1024 * 1024, // 5MB limit
}).single("image"), validateImageType, validateMedical(medicationSchema), createMedication);

// GET /api/medications - get medication reminders for the user
router.get("/", getUserMiddleware, getMedicationReminders);

export default router; 