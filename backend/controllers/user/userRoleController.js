import {bulkUpdateUserRoles, getUsersByRole, updateUserRole} from "../../models/admin/adminModel.js";
import {ErrorFactory} from "../../utils/AppError.js";

/**
 * @openapi
 * /api/users/{id}/role:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user role
 *     description: Update a user's role. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [User, Admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid user ID or role
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user role
 */
export const updateUserRoleController = async (req, res, next) => {
  try {
    const {id: userId} = req.params; // Fix: use 'id' from params, not 'userId'
    const {role} = req.body;

    // Validate input
    if (!userId || isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }

    if (!role || !['User', 'Admin'].includes(role)) {
      throw ErrorFactory.validation("Invalid role. Must be 'User' or 'Admin'");
    }

    // Prevent admin from demoting themselves
    if (parseInt(userId) === req.user.id && role !== 'Admin') {
      throw ErrorFactory.validation("Cannot change your own admin role");
    }

    await updateUserRole(parseInt(userId), role);
    res.status(200).json({
      message: `User role updated to ${role} successfully`,
      userId: parseInt(userId),
      newRole: role
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return next(ErrorFactory.notFound("User"));
    }
    next(error);
  }
};

/**
 * @openapi
 * /api/users/role/{role}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get users by role
 *     description: Get a list of users by their role. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: The role to filter by.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role
 *       500:
 *         description: Error fetching users by role
 */
export const getUsersByRoleController = async (req, res, next) => {
  try {
    let {role} = req.params;
    
    if (!role) {
      throw ErrorFactory.validation("Invalid role. Must be 'user' or 'admin'");
    }
    
    role = role.charAt(0).toUpperCase() + role.slice(1)

    if (!['User', 'Admin'].includes(role)) {
      throw ErrorFactory.validation("Invalid role. Must be 'user' or 'admin'");
    }

    const users = await getUsersByRole(role);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/users/role/bulk:
 *   put:
 *     tags:
 *       - User
 *     summary: Bulk update user roles
 *     description: Bulk update the roles of multiple users. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userRoleUpdates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     role:
 *                       type: string
 *                       enum: [User, Admin]
 *     responses:
 *       200:
 *         description: User roles updated successfully
 *       400:
 *         description: Invalid user role updates array
 *       500:
 *         description: Error updating user roles
 */
export const bulkUpdateUserRolesController = async (req, res, next) => {
  try {
    const {userRoleUpdates} = req.body;

    // Validate input
    if (!Array.isArray(userRoleUpdates) || userRoleUpdates.length === 0) {
      throw ErrorFactory.validation("Invalid user role updates array");
    }

    // Validate each update
    for (const update of userRoleUpdates) {
      if (!update.userId || !update.role || !['User', 'Admin'].includes(update.role)) {
        throw ErrorFactory.validation("Invalid update format. Each update must have userId and valid role");
      }

      // Prevent admin from demoting themselves
      if (update.userId === req.user.id && update.role !== 'Admin') {
        throw ErrorFactory.validation("Cannot change your own admin role");
      }
    }

    const updatedCount = await bulkUpdateUserRoles(userRoleUpdates);
    res.status(200).json({
      message: `${updatedCount} user roles updated successfully`,
      updatedCount,
      updates: userRoleUpdates
    });
  } catch (error) {
    next(error);
  }
};