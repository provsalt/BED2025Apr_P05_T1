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
    `;
    const request = db.request();
    request.input("userId", userId);
    await request.query(query);
}

export const removeAdminRole = async (userId) => {
    const db = await sql.connect(dbConfig);
    const query = `
        UPDATE Users
        SET role = 'User'
        WHERE id = @userId;
    `;
    const request = db.request();
    request.input("userId", userId);
    await request.query(query);
}

export const getAllAdmins = async () => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM Users WHERE role = 'Admin'";
    const request = db.request();
    const result = await request.query(query);
    
    return result.recordset;
}  