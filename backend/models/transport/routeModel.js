
import { dbConfig } from "../../config/db.js";
import sql from "mssql";

/**
 * Creates a new user route in the database.
 * @param {number} userId - The ID of the user.
 * @param {string} startStation - The starting station code.
 * @param {string} endStation - The ending station code.
 * @returns {Promise<object>} The newly created route object.
 */
export const createRoute = async (userId, startStation, endStation) => {
    const db = await sql.connect(dbConfig);
    const query = `
        INSERT INTO UserRoutes (user_id, start_station, end_station)
        VALUES (@userId, @startStation, @endStation);
        SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = db.request();
    request.input("userId", sql.Int, userId);
    request.input("startStation", sql.VarChar, startStation);
    request.input("endStation", sql.VarChar, endStation);
    const result = await request.query(query);
    const id = result.recordset[0].id;
    return { id, user_id: userId, start_station: startStation, end_station: endStation };
};

/**
 * Retrieves a specific route by its ID.
 * @param {number} routeId - The ID of the route.
 * @returns {Promise<object|null>} The route object or null if not found.
 */
export const getRouteById = async (routeId) => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM UserRoutes WHERE id = @routeId";
    const request = db.request();
    request.input("routeId", sql.Int, routeId);
    const result = await request.query(query);
    return result.recordset.length > 0 ? result.recordset[0] : null;
};

/**
 * Retrieves all routes for a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<object>>} An array of route objects.
 */
export const getRoutesByUserId = async (userId) => {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM UserRoutes WHERE user_id = @userId";
    const request = db.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query(query);
    return result.recordset;
};

/**
 * Updates an existing route.
 * @param {number} routeId - The ID of the route to update.
 * @param {string} startStation - The new starting station code.
 * @param {string} endStation - The new ending station code.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
export const updateRoute = async (routeId, startStation, endStation) => {
    const db = await sql.connect(dbConfig);
    const query = `
        UPDATE UserRoutes
        SET start_station = @startStation, end_station = @endStation
        WHERE id = @routeId;
    `;
    const request = db.request();
    request.input("routeId", sql.Int, routeId);
    request.input("startStation", sql.VarChar, startStation);
    request.input("endStation", sql.VarChar, endStation);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
};

/**
 * Deletes a route from the database.
 * @param {number} routeId - The ID of the route to delete.
 * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
 */
export const deleteRoute = async (routeId) => {
    const db = await sql.connect(dbConfig);
    const query = "DELETE FROM UserRoutes WHERE id = @routeId";
    const request = db.request();
    request.input("routeId", sql.Int, routeId);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
};
