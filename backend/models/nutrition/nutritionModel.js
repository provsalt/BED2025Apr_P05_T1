import mssql from "mssql";
import { dbConfig } from "../../config/db.js";

// Create a new food meal in the database
export const createmeal = async (mealData) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = `
      INSERT INTO Meal (name, category, carbohydrates, protein, fat, calories, ingredients, scanned_at, image_url, user_id)
      VALUES (@name, @category, @carbohydrates, @protein, @fat, @calories, @ingredients, GETDATE(), @image_url, @user_id);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = connection.request();
    request.input("name", mssql.NVarChar, mealData.name);
    request.input("category", mssql.NVarChar, mealData.category);
    request.input("carbohydrates", mssql.Decimal(5,2), Number(mealData.carbohydrates));
    request.input("protein", mssql.Decimal(5,2), Number(mealData.protein));
    request.input("fat", mssql.Decimal(5,2), Number(mealData.fat));
    request.input("calories", mssql.Decimal(5,2), Number(mealData.calories));
    request.input("ingredients", mssql.NVarChar, mealData.ingredients);
    request.input("scanned_at", mssql.DateTime, mealData.scanned_at || new Date());
    request.input("image_url", mssql.NVarChar, mealData.image_url);
    request.input("user_id", mssql.Int, mealData.user_id);
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
export const getMealById = async (id) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = "SELECT * FROM Meal WHERE id = @id";
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

// Get all meals for a user
export const getMealsByUserId = async (userId) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = "SELECT * FROM Meal WHERE user_id = @userId";
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(query);

    return result.recordset;
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
