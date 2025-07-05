import { addAdminRole, getAllAdmins, removeAdminRole } from "../../models/admin/adminModel.js";
import { getUserByEmail } from "../../models/user/userModel.js";
import { User } from "../../utils/validation/user.js";
import { SignJWT } from "jose";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
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