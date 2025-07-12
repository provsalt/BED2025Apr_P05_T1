import {dbConfig} from "../../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";

/**
 * User model for interacting with the database.
 * @param id {number}
 * @returns {Promise<Object|null>}
 */
export const getUser = async (id) => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM Users WHERE id = @id";
    const request = db.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
};


export const getUserByEmail = async (email) => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM Users WHERE email = @email";
    const request = db.request();
    request.input("email", email);
    const result = await request.query(query)

    if (result.recordset.length === 0) {
        return null;
    }

    return result.recordset[0];
}

/**
 * Creates a new user in the database.
 * @param userData {object}
 * @returns {Promise<>}
 */
export const createUser = async (userData) => {
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
  const db = await sql.connect(dbConfig);
  const currentUser = await getUser(id);
  if (!currentUser) {
    throw new Error("User not found");
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
};


/**
 * Deletes a user from the database.
 * @param id {number}
 * @returns {Promise<boolean>}
 */
export const deleteUser = async (id) => {
    const db = await sql.connect(dbConfig);
    const query = "DELETE FROM Users WHERE id = @id";
    const request = db.request();
    request.input("id", id);

    const res = await request.query(query);

    return res.rowsAffected[0] !== 0;
}

export const updateUserProfilePicture = async (userId, fileUrl) => {
  const db = await sql.connect(dbConfig);
  const query = ` UPDATE Users
                  SET profile_picture_url = @url
                  WHERE id = @id`;
  const request = db.request();
  request.input("url", fileUrl);
  request.input("id", userId);
  const result = await request.query(query);
  return result.rowsAffected[0] > 0;
}

export const getLoginHistoryByUserId = async (userId) => {
  const db = await sql.connect(dbConfig);
  const result = await db.request()
    .input("userId", sql.Int, userId)
    .query("SELECT id, CONVERT(VARCHAR(30), login_time, 126) as login_time FROM UserLoginHistory WHERE user_id = @userId ORDER BY login_time DESC");
  return result.recordset;
};

export const insertLoginHistory = async (userId) => {
  const db = await sql.connect(dbConfig);
  await db.request()
    .input("userId", sql.Int, userId)
    .query("INSERT INTO UserLoginHistory (user_id) VALUES (@userId)");
};

export const changeUserRole = async (id, role) => {
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
}

export const getAllUsers = async () => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM Users";
    const request = db.request();
    const result = await request.query(query);
    return result.recordset;
}