import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";

/**
 * Admin model for interacting with the database.
 * Create server-wide announcements. **/

export const createAnnouncement = async (announcementData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO Announcements (title, content, created_at, image)
        VALUES (@title, @content, GETDATE(), @image);
        SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = db.request();
    
    request.input("title", announcementData.title);
    request.input("content", announcementData.content);
    request.input("created_at", new Date());
    request.input("image", announcementData.image || null);
    const res = await request.query(query);
    
    return res.recordset[0];
}

export const getAnnouncements = async () => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM Announcements ORDER BY created_at DESC";
    const request = db.request();
    const result = await request.query(query);
    
    return result.recordset;
}