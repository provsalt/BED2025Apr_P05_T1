import {dbConfig} from "../../config/db.js";
import sql from "mssql";

/**
 * Admin model for interacting with the database.
 * Create server-wide announcements.
 */

export const createAnnouncement = async (announcementData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO Announcement (title, content, user_id, created_at, updated_at)
        VALUES (@title, @content, @user_id, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = db.request();
    
    request.input("title", sql.VarChar(255), announcementData.title);
    request.input("content", sql.Text, announcementData.content);
    request.input("user_id", sql.Int, announcementData.user_id);
    
    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
        throw new Error("Failed to create announcement");
    }
    
    return { 
        id: result.recordset[0].id, 
        ...announcementData,
        created_at: new Date(),
        updated_at: new Date()
    };
}

export const getAnnouncements = async () => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            a.id, 
            a.title, 
            a.content, 
            a.created_at, 
            a.updated_at,
            u.name as author_name,
            u.email as author_email
        FROM Announcement a
        INNER JOIN Users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    `;
    const request = db.request();
    const result = await request.query(query);
    
    return result.recordset;
}

export const getAnnouncementById = async (id) => {
    const db = await sql.connect(dbConfig);
    const query = `
        SELECT 
            a.id, 
            a.title, 
            a.content, 
            a.created_at, 
            a.updated_at,
            u.name as author_name,
            u.email as author_email
        FROM Announcement a
        INNER JOIN Users u ON a.user_id = u.id
        WHERE a.id = @id
    `;
    const request = db.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
        return null;
    }
    
    return result.recordset[0];
}

export const updateAnnouncement = async (id, announcementData) => {
    const db = await sql.connect(dbConfig);
    const query = `
        UPDATE Announcement 
        SET title = @title, content = @content, updated_at = GETDATE()
        WHERE id = @id;
        SELECT @@ROWCOUNT as affectedRows;
    `;
    const request = db.request();
    
    request.input("id", sql.Int, id);
    request.input("title", sql.VarChar(255), announcementData.title);
    request.input("content", sql.Text, announcementData.content);
    
    const result = await request.query(query);
    
    if (result.recordset[0].affectedRows === 0) {
        throw new Error("Announcement not found or update failed");
    }
    
    return result.recordset[0].affectedRows;
}

export const deleteAnnouncement = async (id) => {
    const db = await sql.connect(dbConfig);
    const query = `
        DELETE FROM Announcement WHERE id = @id;
        SELECT @@ROWCOUNT as affectedRows;
    `;
    const request = db.request();
    request.input("id", sql.Int, id);
    
    const result = await request.query(query);
    
    if (result.recordset[0].affectedRows === 0) {
        throw new Error("Announcement not found");
    }
    
    return result.recordset[0].affectedRows;
}