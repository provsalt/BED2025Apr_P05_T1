import { updateUserRole, getUsersByRole, bulkUpdateUserRoles } from "../../models/admin/adminModel.js";

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
export const updateUserRoleController = async (req, res) => {
    const { id: userId } = req.params; // Fix: use 'id' from params, not 'userId'
    const { role } = req.body;

    // Validate input
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!role || !['User', 'Admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be 'User' or 'Admin'" });
    }

    // Prevent admin from demoting themselves
    if (parseInt(userId) === req.user.id && role !== 'Admin') {
        return res.status(400).json({ error: "Cannot change your own admin role" });
    }

    try {
        await updateUserRole(parseInt(userId), role);
        res.status(200).json({ 
            message: `User role updated to ${role} successfully`,
            userId: parseInt(userId),
            newRole: role
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Error updating user role" });
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
export const getUsersByRoleController = async (req, res) => {
    let { role } = req.params;
    role = role.charAt(0).toUpperCase() + role.slice(1)

    if (!role || !['User', 'Admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
    }

    try {
        const users = await getUsersByRole(role);
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users by role:", error);
        res.status(500).json({ error: "Error fetching users by role" });
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
export const bulkUpdateUserRolesController = async (req, res) => {
    const { userRoleUpdates } = req.body;

    // Validate input
    if (!Array.isArray(userRoleUpdates) || userRoleUpdates.length === 0) {
        return res.status(400).json({ error: "Invalid user role updates array" });
    }

    // Validate each update
    for (const update of userRoleUpdates) {
        if (!update.userId || !update.role || !['User', 'Admin'].includes(update.role)) {
            return res.status(400).json({ error: "Invalid update format. Each update must have userId and valid role" });
        }
        
        // Prevent admin from demoting themselves
        if (update.userId === req.user.id && update.role !== 'Admin') {
            return res.status(400).json({ error: "Cannot change your own admin role" });
        }
    }

    try {
        const updatedCount = await bulkUpdateUserRoles(userRoleUpdates);
        res.status(200).json({ 
            message: `${updatedCount} user roles updated successfully`,
            updatedCount,
            updates: userRoleUpdates
        });
    } catch (error) {
        console.error("Error bulk updating user roles:", error);
        res.status(500).json({ error: "Error updating user roles" });
    }
};