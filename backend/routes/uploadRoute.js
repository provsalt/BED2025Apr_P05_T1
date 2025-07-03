import express from "express";
 import { upload } from "../middleware/uploadMiddleware.js";
import { uploadProfilePictureController } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/user/:id/picture", upload.single("avatar"), uploadProfilePictureController);
export default router;
