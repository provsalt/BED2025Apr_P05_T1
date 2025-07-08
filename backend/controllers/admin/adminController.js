import { addAdminRole, getAllAdmins, removeAdminRole, getAllUsers, getUserWithRole, 
updateUserRole, deleteUser, getUsersByRole, bulkUpdateUserRoles } from "../../models/admin/adminModel.js";
import { getUserByEmail } from "../../models/user/userModel.js";
import { SignJWT } from "jose";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import {dbConfig} from "../../config/db.js";
import sql from "mssql";
/**
 * Add admin role to a user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
export const addAdminRoleController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const body = req.body;

    const validate = z.object({
        userId: z.number().int().positive()
    }).safeParse(body);

    if (!validate.success) {
        return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
    }

    try {
        await addAdminRole(validate.data.userId);
        res.status(200).json({ message: "User role updated to Admin" });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Error updating user role" });
    }
}
/** 
 * login as admin
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
export const loginAdminController = async (req, res) => {
    const body = req.body;
    const validate = z.object({
        email: z.string().email().max(255),
        password: z.string().min(12).max(255).regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter").regex(/(?=.*[!@#$%^&*()])/, "Password must contain at least one special character"),
    }).safeParse(body);
    
    if (!validate.success) {
        return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
    }
    
    try {
        const user = await getUserByEmail(validate.data.email);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const isPasswordValid = await bcrypt.compare(validate.data.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        if (user.role !== 'Admin') {
            return res.status(403).json({ error: "Access denied, admin role required" });
        }
        
        const secret = new TextEncoder().encode(process.env.SECRET || "");
        const tok = await new SignJWT({
            sub: user.id,
            role: user.role,
            email: user.email
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("2h")
            .sign(secret);
            
        res.status(200).json({ 
            token: tok,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get all admins
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
export const getAllAdminsController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    try {
        const admins = await getAllAdmins();
        res.status(200).json(admins);
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ error: "Error fetching admins" });
    } 
}

/**
 * Remove admin role from a user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
export const removeAdminRoleController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const body = req.body;

    const validate = z.object({
        userId: z.number().int().positive()
    }).safeParse(body);

    if (!validate.success) {
        return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
    }

    try {
        await removeAdminRole(validate.data.userId);
        res.status(200).json({ message: "User role updated to User" });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Error updating user role" });
    } 
}

/**
 * Get all users with their roles (Admin only)
 */
export const getAllUsersController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
};

/**
 * Get user by ID with role information (Admin only)
 */
export const getUserByIdController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await getUserWithRole(parseInt(userId));
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Error fetching user" });
    }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRoleController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
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
 * Delete user (Admin only)
 */
export const deleteUserController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
    }

    try {
        await deleteUser(parseInt(userId));
        res.status(200).json({ 
            message: "User deleted successfully",
            deletedUserId: parseInt(userId)
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Error deleting user" });
    }
};

/**
 * Get users by role (Admin only)
 */
export const getUsersByRoleController = async (req, res) => {
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

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
    // Check if requesting user is admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

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