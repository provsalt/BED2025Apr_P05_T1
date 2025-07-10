import { updateUserRole, getUsersByRole, bulkUpdateUserRoles } from "../../models/admin/adminModel.js";

/**
 * Update user role (Admin only)
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
 * Get users by role (Admin only)
 */
export const getUsersByRoleController = async (req, res) => {
    const { role } = req.params;
    
    if (!role || !['User', 'Admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Must be 'User' or 'Admin'" });
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
 * Bulk update user roles (Admin only)
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