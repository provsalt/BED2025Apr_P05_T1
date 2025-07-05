import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";

/**
 * Admin model for interacting with the database.
 */

export const addAdminRole = async (userId) => {
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
        throw new Error("User not found");
    }
    
    return result.recordset[0].affectedRows;
}

export const removeAdminRole = async (userId) => {
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
        throw new Error("User not found or is not an admin");
    }
    
    return result.recordset[0].affectedRows;
}

export const getAllAdmins = async () => {
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
}  