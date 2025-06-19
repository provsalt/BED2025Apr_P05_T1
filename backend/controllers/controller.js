import {createUserController, getCurrentUserController, changePasswordController, getUserController, updateUserController} from "./user/userController.js";  // Import user controller functions   "getUserController, updateUserController"
import {getUserMiddleware} from "../middleware/getUser.js";
import { uploadProfilePic } from "../middleware/userSettingsUpload.js";
import sql from "mssql";
import { dbConfig } from "../config/db.js";


/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {
  app.get("/api/users/:id", getUserController)
  app.put("/api/users/:id", updateUserController);
  app.post("/api/user", createUserController)
  app.get("/api/user", getUserMiddleware, getCurrentUserController)
  app.put("/api/users/:id/password", changePasswordController);


//upload profile picture
app.post("/api/users/:id/picture", uploadProfilePic.single("avatar"), async (req, res) => {
    const userId = parseInt(req.params.id);
    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      const db = await sql.connect(dbConfig);
      await db.request()
        .input("id", userId)
        .input("profile_picture_url", filePath)
        .query("UPDATE [user] SET profile_picture_url = @profile_picture_url WHERE id = @id");

      res.json({ message: "Profile picture uploaded", path: filePath });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
};