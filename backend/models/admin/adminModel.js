import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";

/**
 * Admin model for interacting with the database.
 * @param id {number}
 * @returns {Promise<Object|null>}
 */
export const getAdminById = async (id) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM admin WHERE id = @id";
    const request = db.request();
    request.input("id", id);
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Error fetching admin:", error);
    throw error;
  } finally {
    sql.close();
  }
};

/**
 * Creates a new admin in the database.
 * @param adminData {object}
 * @returns {Promise<Object>}
 */
export const createAdmin = async (adminData) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      INSERT INTO admin (name, email, hashedPassword, dob)
      VALUES (@name, @email, @hashedPassword, @dob);
    `;
    const request = db.request();
    request.input("name", adminData.name);
    request.input("email", adminData.email);
    request.input("hashedPassword", await bcrypt.hash(adminData.password, 10));
    request.input("dob", adminData.dob);
    await request.query(query);
    return { id: adminData.id, ...adminData };
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  } finally {
    sql.close();
  }
};

/**
 * Updates an existing admin in the database.
 * @param id {number}
 * @param adminData {object}
 * @returns {Promise<Object>}
 */
export const updateAdmin = async (id, adminData) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      UPDATE admin
      SET name = @name, email = @email, hashedPassword = @hashedPassword, dob = @dob
      WHERE id = @id;
    `;
    const request = db.request();
    request.input("id", id);
    request.input("name", adminData.name);
    request.input("email", adminData.email);
    request.input("hashedPassword", await bcrypt.hash(adminData.password, 10));
    request.input("dob", adminData.dob);
    await request.query(query);
    return { id, ...adminData };
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  } finally {
    sql.close();
  }
};

/**
 * Deletes an admin from the database.
 * @param id {number}
 * @returns {Promise<void>}
 */
export const deleteAdmin = async (id) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "DELETE FROM admin WHERE id = @id";
    const request = db.request();
    request.input("id", id);
    await request.query(query);
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  } finally {
    sql.close();
  }
};
/**
 * Gets all admins from the database.
 * @returns {Promise<Array>}
 */
export const getAllAdmins = async () => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM admin";
    const result = await db.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching all admins:", error);
    throw error;
  } finally {
    sql.close();
  }
};
//
