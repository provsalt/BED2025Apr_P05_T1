import { dbConfig } from "../config/db.js";
import sql from "mssql";

export const createAnnouncement = async (announcementData) => {
  try {
    const db = await sql.connect(dbConfig);
    const request = db.request();
    request.input("title", announcementData.title);
    request.input("content", announcementData.content);
    request.input("createdBy", announcementData.createdBy);
    const result = await request.query(`
      INSERT INTO announcements (title, content, created_by)
      VALUES (@title, @content, @createdBy);
      SELECT SCOPE_IDENTITY() AS id;
    `);
    return { id: result.recordset[0].id, ...announcementData };
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  } finally {
    sql.close();
  }
}

export const getAnnouncements = async () => {
  try {
    const db = await sql.connect(dbConfig);
    const request = db.request();
    const result = await request.query("SELECT * FROM announcements ORDER BY created_at DESC");
    return result.recordset || [];
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  } finally {
    sql.close();
  }
}