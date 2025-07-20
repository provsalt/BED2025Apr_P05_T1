import {
  getUsersWithDeletionRequested,
  approveUserDeletionRequest
} from "../../models/user/userModel.js";

/**
 * @openapi
 * /api/admin/deletion-requests:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all account deletion requests
 *     description: Admin only. Get all users who have requested account deletion.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with deletion requests
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const getDeletionRequestsController = async (req, res) => {
  try {
    const users = await getUsersWithDeletionRequested();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @openapi
 * /api/admin/approve-delete:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Approve and delete user account
 *     description: Admin only. Approve and delete a user's account after deletion request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Failed to delete user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const approveUserDeletionController = async (req, res) => {
  const {userId} = req.body;
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  try {
    const success = await approveUserDeletionRequest(userId);
    if (!success) {
      return res.status(400).json({ error: "Failed to delete user" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
