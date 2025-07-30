import { Router } from "express";
import { createMedication, getMedicationReminders, updateMedication, deleteMedication, submitMedicationQuestionnaire, generateUserHealthSummary, getUserHealthSummary, getLatestQuestionnaire } from "./medicalController.js";
import { genericUploadMiddleware } from "../../middleware/upload.js";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { medicationSchema, medicationQuestionnaireSchema } from "../../utils/validation/medical.js";

const router = Router();

// POST /api/medications - Create medication reminder
router.post("/", getUserMiddleware, genericUploadMiddleware.single("image"), validateSchema(medicationSchema), createMedication);

// GET /api/medications - get medication reminders for the user
router.get("/", getUserMiddleware, getMedicationReminders);

// PUT /api/medications/:id - Update medication reminder
router.put("/:id", getUserMiddleware, genericUploadMiddleware.single("image"), validateSchema(medicationSchema), updateMedication);

// DELETE /api/medications/:id - Delete a medication reminder by ID for user
router.delete('/:id', getUserMiddleware, deleteMedication);

// POST  /api/medications/questionnaire - Submit medication questionnaire
router.post("/questionnaire", getUserMiddleware, validateSchema(medicationQuestionnaireSchema), submitMedicationQuestionnaire);

// GET /api/medications/questionnaire/latest - Get latest questionnaire data
router.get("/questionnaire/latest", getUserMiddleware, getLatestQuestionnaire);

// POST /api/medications/health-summary - Generate health summary from questionnaire
router.post("/health-summary", getUserMiddleware, generateUserHealthSummary);

// GET /api/medications/health-summary - Get latest health summary
router.get("/health-summary", getUserMiddleware, getUserHealthSummary);

export default router; 