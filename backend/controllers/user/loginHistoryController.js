import { getLoginHistoryByUserId } from "../../models/user/userModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

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
export const getUserLoginHistoryController = async (req, res, next) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized("Unauthorized");
    }
    
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

    if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw ErrorFactory.validation("Limit must be a number between 1 and 100");
    }

    const logins = await getLoginHistoryByUserId(userId, limit);
    res.status(200).json(logins);
  } catch (error) {
    next(error);
  }
};
