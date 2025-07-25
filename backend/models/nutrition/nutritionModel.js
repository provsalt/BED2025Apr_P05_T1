import mssql from "mssql";
import { dbConfig } from "../../config/db.js";

// Create a new food meal in the database
export const createMeal = async (mealData) => {
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
    request.input("carbohydrates", mssql.Decimal(7,2), Number(mealData.carbohydrates));
    request.input("protein", mssql.Decimal(7,2), Number(mealData.protein));
    request.input("fat", mssql.Decimal(7,2), Number(mealData.fat));
    request.input("calories", mssql.Decimal(7,2), Number(mealData.calories));
    request.input("ingredients", mssql.NVarChar, mealData.ingredients);
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
export const getAllMeals = async (userId) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = "SELECT * FROM Meal WHERE user_id = @userId ORDER BY scanned_at DESC";
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

// Delete a meal by its ID
export const deleteMeal = async (id) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = "DELETE FROM Meal WHERE id = @id";
    const request = connection.request();
    request.input("id", id);

    await request.query(query);
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

//Update a meal by its ID
export const updateMeal = async(id, mealData) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query =
      "UPDATE Meal SET name = @name, category = @category, carbohydrates = @carbohydrates, protein = @protein, fat = @fat, calories = @calories, ingredients = @ingredients WHERE id = @id";
      const request = connection.request();
    request.input("id", id);
    request.input("name", mssql.NVarChar, mealData.name);
    request.input("category", mssql.NVarChar, mealData.category);
    request.input("carbohydrates", mssql.Decimal(7,2), Number(mealData.carbohydrates));
    request.input("protein", mssql.Decimal(7,2), Number(mealData.protein));
    request.input("fat", mssql.Decimal(7,2), Number(mealData.fat));
    request.input("calories", mssql.Decimal(7,2), Number(mealData.calories));
    request.input("ingredients", mssql.NVarChar, mealData.ingredients);
    await request.query(query);

    return await getMealById(id); // Return the updated meal
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

// Search meals for a user by name
export const searchMeals = async (userId, searchTerm) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    const query = `
      SELECT * FROM Meal 
      WHERE user_id = @userId 
      AND name LIKE @searchTerm
      ORDER BY scanned_at DESC
    `;
    const request = connection.request();
    request.input("userId", userId);
    request.input("searchTerm", `%${searchTerm}%`); 
    // wildcards search to match any part of the name searched, 
    // e.g. hainanese chicken rice will be fetched if chicken is searched
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
