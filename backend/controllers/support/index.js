import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import { validateSchema } from "../../middleware/validateSchema.js";
import { chatWithAI } from "./supportController.js";
import {supportChatSchema} from "../../utils/validation/support.js";
import {openaiRateLimit} from "../../middleware/rateLimit.js";

const router = Router();

router.use(openaiRateLimit)

router.post("/chat", validateSchema(supportChatSchema), chatWithAI);

export default router;