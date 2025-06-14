import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";

/**
 * get permissions for a user
 * @param userId {number}
 * @returns {Promise<Array>}
 */
export const getUserPermissions = async (userId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "SELECT p.* FROM permissions p JOIN user_permissions up ON p.id = up.permission_id WHERE up.user_id = @userId";
    const request = db.request();
    request.input("userId", userId);
    const result = await request.query(query);
    return result.recordset || [];
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    throw error;
  } finally {
    sql.close();
  }
};
/**
 * Assign permissions to a user
 * @param userId {number}
 * @param permissionIds {Array<number>}
 * @returns {Promise<void>}
 */  
export const assignUserPermissions = async (userId, permissionIds) => {
  try {
    const db = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(db);
    await transaction.begin();
    const request = new sql.Request(transaction);
    
    // Delete existing permissions
    await request.query("DELETE FROM user_permissions WHERE user_id = @userId", { userId });
    
    // Insert new permissions
    for (const permissionId of permissionIds) {
      await request.query("INSERT INTO user_permissions (user_id, permission_id) VALUES (@userId, @permissionId)", {
        userId,
        permissionId
      });
    }
    
    await transaction.commit();
  } catch (error) {
    console.error("Error assigning user permissions:", error);
    throw error;
  } finally {
    sql.close();
  }
};
/**
 * update permissions for a user
 * @param userId {number}   
 */
export const updateUserPermissions = async (userId, permissionIds) => {
  try {
    const db = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(db);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Delete existing permissions
    await request.query("DELETE FROM user_permissions WHERE user_id = @userId", { userId });

    // Insert new permissions
    for (const permissionId of permissionIds) {
      await request.query("INSERT INTO user_permissions (user_id, permission_id) VALUES (@userId, @permissionId)", {
        userId,
        permissionId
      });
    }

    await transaction.commit();
  } catch (error) {
    console.error("Error updating user permissions:", error);
    throw error;
  } finally {
    sql.close();
  }
};
/**
 * Remove permissions from a user
 * @param userId {number}
 * @param permissionIds {Array<number>}
 * @returns {Promise<void>}
 */
export const removeUserPermissions = async (userId, permissionIds) => {
  try {
    const db = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(db);
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Delete specified permissions
    for (const permissionId of permissionIds) {
      await request.query("DELETE FROM user_permissions WHERE user_id = @userId AND permission_id = @permissionId", {
        userId,
        permissionId
      });
    }

    await transaction.commit();
  } catch (error) {
    console.error("Error removing user permissions:", error);
    throw error;
  } finally {
    sql.close();
  }
};
/**
 * Get all permissions
 * @returns {Promise<Array>}
 */
export const getAllPermissions = async () => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM permissions";
    const result = await db.request().query(query);
    return result.recordset || [];
  } catch (error) {
    console.error("Error fetching all permissions:", error);
    throw error;
  } finally {
    sql.close();
  }
};
