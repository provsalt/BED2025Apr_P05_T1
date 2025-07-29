import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";

const router = Router();

/**
 * @openapi
 * /api/home/dashboard:
 *   get:
 *     tags:
 *       - Home
 *     summary: Get dashboard data for authenticated user
 *     description: Returns basic dashboard information for the home page
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: User not authenticated
 */
router.get("/dashboard", getUserMiddleware, (req, res) => {
  try {
    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve dashboard data" });
  }
});

export default router; 