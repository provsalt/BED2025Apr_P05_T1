import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * User model for interacting with the database.
 * @param id {number}
 * @returns {Promise<Object|null>}
 */
export const getUser = async (id) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = "SELECT * FROM Users WHERE id = @id";
        const request = db.request();
        request.input("id", id);
        const result = await request.query(query);

        if (result.recordset.length === 0) {
          return null;
        }

        return result.recordset[0];
    } catch (error) {
        throw ErrorFactory.database(`Failed to get user: ${error.message}`, "Unable to process request at this time", error);
    }
};


export const getUserByEmail = async (email) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = "SELECT * FROM Users WHERE email = @email";
        const request = db.request();
        request.input("email", email);
        const result = await request.query(query)

        if (result.recordset.length === 0) {
            return null;
        }

        return result.recordset[0];
    } catch (error) {
        throw ErrorFactory.database(`Failed to get user by email: ${error.message}`, "Unable to process request at this time", error);
    }
}

/**
 * Creates a new user in the database.
 * @param userData {object}
 * @returns {Promise<>}
 */
export const createUser = async (userData) => {
    try {
        const db = await sql.connect(dbConfig);
        const query = `
            INSERT INTO Users (name, email, password, date_of_birth, gender)
            VALUES (@name, @email, @hashedPassword, @dob, @gender);
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const request = db.request();

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        request.input("name", userData.name);
        request.input("email", userData.email);
        request.input("hashedPassword", hashedPassword);
        request.input("dob", new Date(userData.date_of_birth * 1000)); // Convert from seconds to milliseconds
        request.input("gender", userData.gender);
        const res = await request.query(query)

        return res.recordset[0]
    } catch (error) {
        if (error.number === 2627) { // SQL Server unique constraint violation
            throw ErrorFactory.conflict("Email already exists", "An account with this email already exists");
        }
        throw ErrorFactory.database(`Failed to create user: ${error.message}`, "Unable to process request at this time", error);
    }
}

/**
 * Creates a new user in the database for OAuth (no password).
 * @param userData {object}
 * @returns {Promise<*>}
 */
export const createOAuthUser = async (userData) => {
    try {
        const db = await sql.connect(dbConfig);
        
        // Generate a random password for OAuth users (users will not used it)
        const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const hashedPassword = await bcrypt.hash(randomPassword, 12);
        
        const query = `
            INSERT INTO Users (name, email, password, date_of_birth, gender, profile_picture_url)
            OUTPUT INSERTED.*
            VALUES (@name, @email, @password, @dob, @gender, @profile_picture_url);
        `;
        const request = db.request();
        request.input("name", userData.name);
        request.input("email", userData.email);
        request.input("password", hashedPassword);
        request.input("dob", userData.date_of_birth ? new Date(userData.date_of_birth) : new Date('1990-01-01')); // Default date if null
        request.input("gender", userData.gender || null);
        request.input("profile_picture_url", userData.profile_picture_url || null);
        
        const res = await request.query(query);
        return res.recordset[0];
    } catch (error) {
        if (error.number === 2627) { // SQL Server unique constraint violation
            throw ErrorFactory.conflict("Email already exists", "An account with this email already exists");
        }
        throw ErrorFactory.database(`Failed to create OAuth user: ${error.message}`, "Unable to process request at this time", error);
    }
}

/**
 * Updates an existing user in the database.
 * @param id {number}
 * @param userData {{
 *     name?: string,
 *     email?: string,
 *     password?: string,
 *     date_of_birth?: Date
 *     gender?: string
 *     language?: string
 *     profile_picture_url?: string
 *     }}
 * @returns {Promise<boolean>}
 */
export const updateUser = async (id, userData) => {
  try {
    const db = await sql.connect(dbConfig);
    const currentUser = await getUser(id);
    if (!currentUser) {
      throw ErrorFactory.notFound("User");
    }
      const query = `
      UPDATE Users
      SET 
          name = @name,
          email = @email,
          password = @password,
          date_of_birth = @dob,
          gender = @gender
      WHERE id = @id;
      `;


    const request = db.request();
    request.input("id", id);
    request.input("name", userData.name ?? currentUser.name);
    request.input("email", userData.email ?? currentUser.email);

    request.input("password", userData.password ?? currentUser.password);

    // Ensure DOB and gender are safe
    request.input("dob", userData.date_of_birth ?? currentUser.date_of_birth);
    request.input("gender", userData.gender ?? currentUser.gender);
    request.input("language", userData.language ?? currentUser.language);

    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (error) {
    if (error.isOperational) {
      throw error; // Re-throw AppError instances
    }
    throw ErrorFactory.database(`Failed to update user: ${error.message}`, "Unable to process request at this time", error);
  }
};


/**
 * Permanently deletes a user and all related data.
 * Performs cleanup of dependent tables to avoid foreign key issues.
 * @param {number} id - The user ID
 * @returns {Promise<boolean>} True if deleted, false if user not found
 */
export const deleteUser = async (id) => {
  let db;
  const cleanupQueries = [
    "DELETE FROM UserLoginHistory WHERE user_id = @id",
    "DELETE FROM FeatureUsage WHERE user_id = @id",
    "DELETE FROM EngagementSummary WHERE user_id = @id",
    "DELETE FROM UserSessions WHERE user_id = @id",
    "DELETE FROM CommunityEventSignup WHERE user_id = @id",
    "DELETE FROM ChatMsg WHERE sender = @id",
    "DELETE FROM Chat WHERE chat_initiator = @id OR chat_recipient = @id",
    "DELETE FROM Meal WHERE user_id = @id",
    "DELETE FROM Medication WHERE user_id = @id",
    "DELETE FROM MedicationQuestion WHERE user_id = @id",
    "DELETE FROM HealthSummary WHERE user_id = @id",
    "DELETE FROM UserRoutes WHERE user_id = @id",
    "DELETE FROM Announcement WHERE user_id = @id"
  ];

  try {
    db = await sql.connect(dbConfig);

    // Check user existence
    const userCheck = await db.request()
      .input("id", id)
      .query("SELECT id FROM Users WHERE id = @id");

    if (userCheck.recordset.length === 0) {
      return false; // No such user
    }

    // Start transaction
    const transaction = new sql.Transaction(db);
    await transaction.begin();

    try {
      // 1. Cleanup dependent records
      for (const query of cleanupQueries) {
        await transaction.request().input("id", id).query(query);
      }

      // 2. Cleanup Community Events (special handling)
      const request = transaction.request();
      request.input("id", id);

      // Delete related event images first
      await request.query(`
        DELETE FROM CommunityEventImage 
        WHERE community_event_id IN (
          SELECT id FROM CommunityEvent WHERE user_id = @id
        )
      `);

      // Delete events created by the user
      await request.query("DELETE FROM CommunityEvent WHERE user_id = @id");

      // 3. Delete the user
      const result = await transaction.request()
        .input("id", id)
        .query("DELETE FROM Users WHERE id = @id");

      // Commit transaction
      await transaction.commit();

      return result.rowsAffected[0] > 0;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    throw ErrorFactory.database(
      `Failed to delete user: ${error.message}`,
      "Unable to process request at this time",
      error
    );
  } finally {
    if (db) {
      try { await db.close(); } catch { /* ignore close errors */ }
    }
  }
};


export const updateUserProfilePicture = async (userId, fileUrl) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = ` UPDATE Users
                    SET profile_picture_url = @url
                    WHERE id = @id`;
    const request = db.request();
    request.input("url", fileUrl);
    request.input("id", userId);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw ErrorFactory.database(`Failed to update profile picture: ${error.message}`, "Unable to process request at this time", error);
  }
}

export const getLoginHistoryByUserId = async (userId, limit = 10) => {
  try {
    const db = await sql.connect(dbConfig);
    const result = await db.request()
      .input("userId", sql.Int, userId)
      .input("limit", sql.Int, limit)
      .query("SELECT TOP (@limit) id, CONVERT(VARCHAR(30), login_time, 126) as login_time FROM UserLoginHistory WHERE user_id = @userId ORDER BY login_time DESC");
    return result.recordset;
  } catch (error) {
    throw ErrorFactory.database(`Failed to get login history: ${error.message}`, "Unable to process request at this time", error);
  }
};

export const insertLoginHistory = async (userId) => {
  try {
    const db = await sql.connect(dbConfig);
    const utcNow = new Date().toISOString();
    await db.request()
      .input("userId", sql.Int, userId)
      .input("loginTime", utcNow)
      .query("INSERT INTO UserLoginHistory (user_id) VALUES (@userId)");
  } catch (error) {
    throw ErrorFactory.database(`Failed to insert login history: ${error.message}`, "Unable to process request at this time", error);
  }
};

export const changeUserRole = async (id, role) => {
    try {
        const user = await getUser(id)
        if (!user) {
            return false
        }
        const role2 = role.charAt(0).toUpperCase() + role.slice(1)

        if (!(role2 === "User" || role2 === "Admin")) {
            return false
        }

        const db = await sql.connect(dbConfig);

        const query = `
            UPDATE Users
            SET 
                role = @role
            WHERE id = @id;
        `;
        const request = db.request();
        request.input("id", id);
        request.input("role", role2);

        const res = await request.query(query);

        return res.rowsAffected[0] !== 0;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw ErrorFactory.database(`Failed to change user role: ${error.message}`, "Unable to process request at this time", error);
    }
}

export const getAllUsers = async () => {
    try {
        const db = await sql.connect(dbConfig);
        const query = "SELECT * FROM Users";
        const request = db.request();
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        throw ErrorFactory.database(`Failed to get all users: ${error.message}`, "Unable to process request at this time", error);
    }
}

export const requestUserDeletion = async (userId) => {
  try {
    const db = await sql.connect(dbConfig);
    const utcNow = new Date().toISOString(); 
    const query = `
      UPDATE Users 
      SET deletionRequested = 1, deletionRequestedAt = @deletionRequestedAt 
      WHERE id = @id`;
    const request = db.request();
    request.input("id", userId);
    request.input("deletionRequestedAt", utcNow); 
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw ErrorFactory.database(`Failed to request user deletion: ${error.message}`, "Unable to process request at this time", error);
  }
};


export const approveUserDeletionRequest = async (userId) => {
  try {
    return await deleteUser(userId);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw ErrorFactory.database(`Failed to approve user deletion: ${error.message}`, "Unable to process request at this time", error);
  }
};

export const cancelUserDeletionRequest = async (userId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `UPDATE Users SET deletionRequested = 0, deletionRequestedAt = NULL WHERE id = @id`;
    const request = db.request();
    request.input("id", userId);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw ErrorFactory.database(`Failed to cancel user deletion request: ${error.message}`, "Unable to process request at this time", error);
  }
};

export const getUsersWithDeletionRequested = async () => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `SELECT * FROM Users WHERE deletionRequested = 1`;
    const result = await db.request().query(query);
    return result.recordset;
  } catch (error) {
    throw ErrorFactory.database(`Failed to get users with deletion requested: ${error.message}`, "Unable to process request at this time", error);
  }
};

/**
 * Checks if a user is an OAuth user by checking if they have a profile picture from Google
 * This is a temporary solution until we add an oauth_provider field to the database
 * @param {Object} user - User object
 * @returns {boolean} True if user is likely an OAuth user
 */
export const isOAuthUser = (user) => {
  if (!user) return false;
  
  // Check if profile picture URL is from Google
  if (user.profile_picture_url && user.profile_picture_url.includes('googleusercontent.com')) {
    return true;
  }
  
  // Check if user has a very long random password
  // This is not foolproof but helps identify OAuth users created by our system
  return false; // We can't check password length without hashing, so return false for now
};
