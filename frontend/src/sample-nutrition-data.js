// Sample data structure returned from /api/nutrition/analytics/daily?days=7
// This is what your API is returning based on the backend code:

const sampleApiResponse = {
  message: "Daily breakdown retrieved successfully",
  breakdown: [
    // Note: Backend returns in DESC order (newest first)
    {
      date: "2025-07-29", // Today
      day_name: "Monday",
      meals: 3,
      calories: 1850,
      protein: 85,
      carbs: 200, // Note: backend calls this "carbohydrates"
      fat: 65
    },
    {
      date: "2025-07-28", // Yesterday  
      day_name: "Sunday",
      meals: 2,
      calories: 1650,
      protein: 75,
      carbs: 180,
      fat: 55
    },
    {
      date: "2025-07-27", // Day before yesterday
      day_name: "Saturday", 
      meals: 4,
      calories: 2100,
      protein: 95,
      carbs: 230,
      fat: 75
    }
    // ... continues for the number of days requested
  ]
}

// The SQL query from backend:
/*
SELECT 
  CAST(scanned_at AS DATE) as date,
  DATENAME(WEEKDAY, scanned_at) as day_name,
  COUNT(*) as meals,
  SUM(calories) as calories,
  SUM(protein) as protein,
  SUM(carbohydrates) as carbs,  -- Note: this field name
  SUM(fat) as fat
FROM Meal 
WHERE user_id = @userId 
  AND scanned_at >= @startDate
  AND scanned_at <= GETDATE()
GROUP BY CAST(scanned_at AS DATE), DATENAME(WEEKDAY, scanned_at)
ORDER BY date DESC  -- This causes newest first ordering
*/
