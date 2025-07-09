import mssql from "mssql";
import { dbConfig } from "../../config/dbConfig.js";

// Create a new food meal in the database
export const createmeal = async (foodId) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query =
      "INSERT INTO Meals (id) VALUES (@id, @name, @category, @carbohydrates, @protein, @fat, @calories, @ingredients, @scannedtime, @imageurl, @user_id); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    const result = await request.query(query);

    const newMealId = result.recordset[0].id;
    return await getMealById(newMealId);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Get a meal by its ID
export const getMealById = async (mealId) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = "SELECT * FROM Meals WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
