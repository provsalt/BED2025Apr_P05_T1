import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * Admin model for interacting with the database.
 */

export const addAdminRole = async (userId) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            UPDATE Users
            SET role = 'Admin'
            WHERE id = @userId;
            SELECT @@ROWCOUNT as affectedRows;
        `;
        const request = db.request();
        request.input("userId", sql.Int, userId);
        const result = await request.query(query);
        
        if (result.recordset[0].affectedRows === 0) {
            throw ErrorFactory.notFound("User");
        }
        
        return result.recordset[0].affectedRows;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw ErrorFactory.database(`Failed to add admin role: ${error.message}`, "Unable to process request at this time", error);
    }
}

export const removeAdminRole = async (userId) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            UPDATE Users
            SET role = 'User'
            WHERE id = @userId AND role = 'Admin';
            SELECT @@ROWCOUNT as affectedRows;
        `;
        const request = db.request();
        request.input("userId", sql.Int, userId);
        const result = await request.query(query);
        
        if (result.recordset[0].affectedRows === 0) {
            throw ErrorFactory.notFound("Admin user");
        }
        
        return result.recordset[0].affectedRows;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw ErrorFactory.database(`Failed to remove admin role: ${error.message}`, "Unable to process request at this time", error);
    }
}

export const getAllAdmins = async () => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            SELECT id, name, email, created_at, role 
            FROM Users 
            WHERE role = 'Admin'
            ORDER BY created_at DESC
        `;
        const request = db.request();
        const result = await request.query(query);
        
        return result.recordset;
    } catch (error) {
        throw ErrorFactory.database(`Failed to get all admins: ${error.message}`, "Unable to process request at this time", error);
    }
}

/**
 * Get all users with their roles
 */
export const getAllUsers = async () => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            SELECT 
                id, 
                name, 
                email, 
                role, 
                created_at,
                gender,
                date_of_birth
            FROM Users 
            ORDER BY created_at DESC
        `;
        const request = db.request();
        const result = await request.query(query);
        
        return result.recordset;
    } catch (error) {
        throw ErrorFactory.database(`Failed to get all users: ${error.message}`, "Unable to process request at this time", error);
    }
};

/**
 * Get user by ID with role information
 */
export const getUserWithRole = async (userId) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            SELECT 
                id, 
                name, 
                email, 
                role, 
                created_at,
                gender,
                date_of_birth
            FROM Users 
            WHERE id = @userId
        `;
        const request = db.request();
        request.input("userId", sql.Int, userId);
        const result = await request.query(query);
        
        if (result.recordset.length === 0) {
            return null;
        }
        
        return result.recordset[0];
    } catch (error) {
        throw ErrorFactory.database(`Failed to get user with role: ${error.message}`, "Unable to process request at this time", error);
    }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, newRole) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            UPDATE Users
            SET role = @role
            WHERE id = @userId;
            SELECT @@ROWCOUNT as affectedRows;
        `;
        const request = db.request();
        request.input("userId", sql.Int, userId);
        request.input("role", sql.VarChar(100), newRole);
        const result = await request.query(query);
        
        if (result.recordset[0].affectedRows === 0) {
            throw ErrorFactory.notFound("User");
        }
        
        return result.recordset[0].affectedRows;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw ErrorFactory.database(`Failed to update user role: ${error.message}`, "Unable to process request at this time", error);
    }
};

/**
 * Delete user (soft delete by changing role to 'Inactive' or hard delete)
 */
export const deleteUser = async (userId) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            DELETE FROM Users WHERE id = @userId;
            SELECT @@ROWCOUNT as affectedRows;
        `;
        const request = db.request();
        request.input("userId", sql.Int, userId);
        
        const result = await request.query(query);
        
        if (result.recordset[0].affectedRows === 0) {
            throw ErrorFactory.notFound("User");
        }
        
        return result.recordset[0].affectedRows;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw ErrorFactory.database(`Failed to delete user: ${error.message}`, "Unable to process request at this time", error);
    }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            SELECT 
                id, 
                name, 
                email, 
                role, 
                created_at,
                gender,
                date_of_birth
            FROM Users 
            WHERE role = @role
            ORDER BY created_at DESC
        `;
        const request = db.request();
        request.input("role", sql.VarChar(100), role);
        const result = await request.query(query);
        
        return result.recordset;
    } catch (error) {
        throw ErrorFactory.database(`Failed to get users by role: ${error.message}`, "Unable to process request at this time", error);
    }
};

/**
 * Bulk update user roles
 */
export const bulkUpdateUserRoles = async (userRoleUpdates) => {
    const db = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(db);
    
    try {
        await transaction.begin();
        
        for (const update of userRoleUpdates) {
            const request = new sql.Request(transaction);
            request.input("userId", sql.Int, update.userId);
            request.input("role", sql.VarChar(100), update.role);
            
            await request.query(`
                UPDATE Users 
                SET role = @role 
                WHERE id = @userId
            `);
        }
        
        await transaction.commit();
        return userRoleUpdates.length;
    } catch (error) {
        await transaction.rollback();
        throw ErrorFactory.database(`Failed to bulk update user roles: ${error.message}`, "Unable to process request at this time", error);
    }
};