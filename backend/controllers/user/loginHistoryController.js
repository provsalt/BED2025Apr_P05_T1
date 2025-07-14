import { getLoginHistoryByUserId } from "../../models/user/userModel.js";

/**
 * @openapi
 * /api/users/me/login-history:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user login history
 *     description: Get the login history for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LoginHistory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve login history
 */
export const getUserLoginHistoryController = async (req, res) => {
  const userId = req.user.id;

  try {
    const logins = await getLoginHistoryByUserId(userId);
    res.status(200).json(logins);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve login history" });
  }
};
