import {
  getUsersWithDeletionRequested,
  approveUserDeletionRequest
} from "../../models/user/userModel.js";
import {
  getPendingEvents,
  approveCommunityEvent,
  rejectCommunityEvent
} from "../../models/community/communityEventModel.js";

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

/**
 * @openapi
 * /api/admin/community/pending:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all pending community events
 *     description: Admin only. Get all community events that are waiting for admin approval.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending community events
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const getPendingCommunityEventsController = async (req, res) => {
  try {
    const result = await getPendingEvents();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * @openapi
 * /api/admin/community/approve:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Approve a community event
 *     description: Admin only. Approve a pending community event.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event approved successfully
 *       400:
 *         description: Failed to approve event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
export const approveCommunityEventController = async (req, res) => {
  const { eventId } = req.body;
  const adminId = req.user.id;
  
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }
  
  try {
    const result = await approveCommunityEvent(eventId, adminId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * @openapi
 * /api/admin/community/reject:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Reject a community event
 *     description: Admin only. Reject and delete a pending community event.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event rejected successfully
 *       400:
 *         description: Failed to reject event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
export const rejectCommunityEventController = async (req, res) => {
  const { eventId } = req.body;
  
  if (isNaN(eventId)) {
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }
  
  try {
    const result = await rejectCommunityEvent(eventId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
