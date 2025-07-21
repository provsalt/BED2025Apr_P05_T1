import { getAllMeals } from "../../models/nutrition/nutritionModel.js";
import { getMedicationRemindersByUser } from "../../models/medical/medicalModel.js";
import { getRoutesByUserId } from "../../models/transport/routeModel.js";
import { getUpcomingEventsByUser } from "../../models/community/communityEventModel.js";

/**
 * @openapi
 * components:
 *   schemas:
 *     DashboardSummary:
 *       type: object
 *       properties:
 *         meals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Meal ID
 *               name:
 *                 type: string
 *                 description: Name of the meal
 *               image_url:
 *                 type: string
 *                 description: URL of the meal image
 *               scanned_at:
 *                 type: string
 *                 format: date-time
 *                 description: When the meal was scanned
 *               category:
 *                 type: string
 *                 description: Category of the meal
 *               calories:
 *                 type: number
 *                 description: Calories in the meal
 *         events:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Event ID
 *               name:
 *                 type: string
 *                 description: Name of the event
 *               location:
 *                 type: string
 *                 description: Location of the event
 *               category:
 *                 type: string
 *                 description: Category of the event
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the event
 *               time:
 *                 type: string
 *                 description: Time of the event
 *               description:
 *                 type: string
 *                 description: Description of the event
 *               image_url:
 *                 type: string
 *                 description: URL of the event image
 *         medications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Medication ID
 *               medicine_name:
 *                 type: string
 *                 description: Name of the medication
 *               reason:
 *                 type: string
 *                 description: Reason for taking the medication
 *               dosage:
 *                 type: string
 *                 description: Dosage information
 *               medicine_time:
 *                 type: string
 *                 description: Time to take the medication
 *               frequency_per_day:
 *                 type: integer
 *                 description: How many times per day to take
 *               image_url:
 *                 type: string
 *                 description: URL of the medication image
 *         nutrition:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *               description: Total calories consumed
 *             protein:
 *               type: number
 *               description: Total protein in grams
 *             carbs:
 *               type: number
 *               description: Total carbohydrates in grams
 *         transport:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Transport route ID
 *               name:
 *                 type: string
 *                 description: Name of the route
 *               start_station:
 *                 type: string
 *                 description: Starting station
 *               end_station:
 *                 type: string
 *                 description: Ending station
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 */

/**
 * @openapi
 * /api/home/user/summary:
 *   get:
 *     summary: Get dashboard summary for authenticated user
 *     description: Retrieves a comprehensive summary of user data including recent meals, upcoming events, medications, nutrition summary, and transport bookmarks. Limited to the latest 3 items for each category.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *             example:
 *               meals:
 *                 - id: 1
 *                   name: "Grilled Chicken Salad"
 *                   image_url: "https://example.com/chicken-salad.jpg"
 *                   scanned_at: "2024-01-15T12:30:00Z"
 *                   category: "Lunch"
 *                   calories: 350
 *                 - id: 2
 *                   name: "Oatmeal with Berries"
 *                   image_url: "https://example.com/oatmeal.jpg"
 *                   scanned_at: "2024-01-15T08:15:00Z"
 *                   category: "Breakfast"
 *                   calories: 280
 *               events:
 *                 - id: 1
 *                   name: "Community Yoga Class"
 *                   location: "Community Center"
 *                   category: "Fitness"
 *                   date: "2024-01-20"
 *                   time: "10:00 AM"
 *                   description: "Gentle yoga session for seniors"
 *                   image_url: "https://example.com/yoga.jpg"
 *               medications:
 *                 - id: 1
 *                   medicine_name: "Aspirin"
 *                   reason: "Blood thinning"
 *                   dosage: "100mg"
 *                   medicine_time: "08:00"
 *                   frequency_per_day: 1
 *                   image_url: "https://example.com/aspirin.jpg"
 *               nutrition:
 *                 calories: 630
 *                 protein: 25
 *                 carbs: 45
 *               transport:
 *                 - id: 1
 *                   name: "Home to Hospital"
 *                   start_station: "Central Station"
 *                   end_station: "Medical Center"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch dashboard summary"
 */

// GET /api/user/summary
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const meals = await getAllMeals(userId);
    const medResult = await getMedicationRemindersByUser(userId);
    const medications = medResult.success ? medResult.reminders : [];
    const transport = await getRoutesByUserId(userId);
    const events = await getUpcomingEventsByUser(userId);

    let nutrition = { calories: 0, protein: 0, carbs: 0 };
    if (meals && meals.length > 0) {
      nutrition = meals.reduce(
        (acc, meal) => {
          acc.calories += Number(meal.calories) || 0;
          acc.protein += Number(meal.protein) || 0;
          acc.carbs += Number(meal.carbohydrates) || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0 }
      );
    }
    // Format for dashboard 3 items t0 show
    res.json({
      meals: (meals || []).slice(0, 3).map(m => ({
        id: m.id,
        name: m.name,
        image_url: m.image_url,
        scanned_at: m.scanned_at,
        category: m.category,
        calories: m.calories
      })),
      events: (events || []).slice(0, 3),
      medications: (medications || []).slice(0, 3).map(m => ({
        id: m.id,
        medicine_name: m.medicine_name,
        reason: m.reason,
        dosage: m.dosage,
        medicine_time: m.medicine_time,
        frequency_per_day: m.frequency_per_day,
        image_url: m.image_url
      })),
      nutrition,
      transport: (transport || []).slice(0, 3)
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
}; 