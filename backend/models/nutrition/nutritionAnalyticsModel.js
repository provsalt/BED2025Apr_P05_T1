import mssql from "mssql";
import { dbConfig } from "../../config/db.js";

// Get nutrition analytics for a specific time period
export const getNutritionAnalytics = async (userId, days = 7) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all meals in the time period
    const query = `
      SELECT 
        CAST(scanned_at AS DATE) as date,
        COUNT(*) as meal_count,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbohydrates) as total_carbs,
        SUM(fat) as total_fat
      FROM Meal 
      WHERE user_id = @userId 
        AND scanned_at >= @startDate
        AND scanned_at <= GETDATE()
      GROUP BY CAST(scanned_at AS DATE)
      ORDER BY date DESC
    `;
    
    const request = connection.request();
    request.input("userId", mssql.Int, userId);
    request.input("startDate", mssql.DateTime, startDate);
    
    const result = await request.query(query);
    
    // Calculate averages and totals
    const dailyData = result.recordset;
    const totalDays = dailyData.length || 1;
    
    const analytics = {
      avgDailyCalories: dailyData.reduce((sum, day) => sum + (day.total_calories || 0), 0) / totalDays,
      avgProtein: dailyData.reduce((sum, day) => sum + (day.total_protein || 0), 0) / totalDays,
      avgCarbs: dailyData.reduce((sum, day) => sum + (day.total_carbs || 0), 0) / totalDays,
      avgFat: dailyData.reduce((sum, day) => sum + (day.total_fat || 0), 0) / totalDays,
      totalMeals: dailyData.reduce((sum, day) => sum + (day.meal_count || 0), 0),
      dailyBreakdown: dailyData,
      period: days
    };
    
    return analytics;
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
};

// Get detailed daily nutrition breakdown
export const getDailyNutritionBreakdown = async (userId, days = 7) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const query = `
      SELECT 
        CAST(scanned_at AS DATE) as date,
        DATENAME(WEEKDAY, scanned_at) as day_name,
        COUNT(*) as meals,
        SUM(calories) as calories,
        SUM(protein) as protein,
        SUM(carbohydrates) as carbs,
        SUM(fat) as fat
      FROM Meal 
      WHERE user_id = @userId 
        AND scanned_at >= @startDate
        AND scanned_at <= GETDATE()
      GROUP BY CAST(scanned_at AS DATE), DATENAME(WEEKDAY, scanned_at)
      ORDER BY date DESC
    `;
    
    const request = connection.request();
    request.input("userId", mssql.Int, userId);
    request.input("startDate", mssql.DateTime, startDate);
    
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
};

// Get calories trend data for chart
export const getCaloriesTrend = async (userId, days = 7) => {
  let connection;
  try {
    connection = await mssql.connect(dbConfig);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const query = `
      SELECT 
        CAST(scanned_at AS DATE) as date,
        SUM(calories) as calories
      FROM Meal 
      WHERE user_id = @userId 
        AND scanned_at >= @startDate
        AND scanned_at <= GETDATE()
      GROUP BY CAST(scanned_at AS DATE)
      ORDER BY date ASC
    `;
    
    const request = connection.request();
    request.input("userId", mssql.Int, userId);
    request.input("startDate", mssql.DateTime, startDate);
    
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
};
