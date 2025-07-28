import { getMedicationReminders } from '../../controllers/medical/medicalController.js';
import { retrieveMeals, searchMealsController, retrieveMealsById, amendMeal, removeMeal } from '../../controllers/nutrition/mealImageController.js';
import { getStationCodeNameMap, getShortestPath } from '../../controllers/transport/transportController.js';
import { createRouteController, getUserRoutesController, getRouteController, updateRouteController, deleteRouteController } from '../../controllers/transport/routeController.js';
import { getApprovedEvents } from '../../controllers/community/communityEventController.js';
import { getChatsController } from '../../controllers/chat/chatController.js';
import { getChatMessagesController } from '../../controllers/chat/messageController.js';
import { getCurrentUserController } from '../../controllers/user/userController.js';

/**
 * Execute AI tool functions by calling appropriate controller functions
 * @param {string} functionName - Name of the function to execute
 * @param {Object} parameters - Parameters for the function
 * @param {Object} user - User object from request
 * @returns {Promise<Object>} Tool execution result
 */
export const executeAITool = async (functionName, parameters, user) => {
  try {
    // mock request and response objects cause i don't want to touch the model directly.
    const req = {
      user: user,
      params: {},
      query: {},
      body: {},
      validatedBody: {}
    };

    let toolResult = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          toolResult = { statusCode: code, data };
          return mockRes;
        }
      })
    };
    switch (functionName) {
      case "get_current_date":
        const currentDate = new Date();
        const dateInfo = {
          currentDate: currentDate.toISOString(),
          currentDateFormatted: currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          currentTime: currentDate.toLocaleTimeString('en-US'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dayOfWeek: currentDate.getDay(),
          dayOfMonth: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        };
        toolResult = { statusCode: 200, data: dateInfo };
        break;
        
      case "get_user_details":
        await getCurrentUserController(req, mockRes);
        break;
        
      case "get_medication_reminders":
        await getMedicationReminders(req, mockRes);
        break;
        
      case "get_meals":
        await retrieveMeals(req, mockRes);
        break;
        
      case "search_meals":
        req.query = { name: parameters.searchTerm };
        await searchMealsController(req, mockRes);
        break;
        
      case "get_meal_details":
        req.params = { id: parameters.mealId };
        await retrieveMealsById(req, mockRes);
        break;
        
      case "update_meal":
        req.params = { id: parameters.mealId };
        req.body = {
          name: parameters.name,
          category: parameters.category,
          carbohydrates: parameters.carbohydrates,
          protein: parameters.protein,
          fat: parameters.fat,
          calories: parameters.calories,
          ingredients: parameters.ingredients ? [parameters.ingredients] : undefined
        };
        // Remove undefined values
        req.body = Object.fromEntries(
          Object.entries(req.body).filter(([_, value]) => value !== undefined)
        );
        req.validatedBody = req.body;
        await amendMeal(req, mockRes);
        break;
        
      case "delete_meal":
        req.params = { id: parameters.mealId };
        await removeMeal(req, mockRes);
        break;
        
      case "get_transport_stations":
        await getStationCodeNameMap(req, mockRes);
        break;
        
      case "find_shortest_path":
        req.query = { 
          start: parameters.startStation, 
          end: parameters.endStation 
        };
        await getShortestPath(req, mockRes);
        break;
        
      case "get_user_routes":
        await getUserRoutesController(req, mockRes);
        break;
        
      case "get_route_details":
        req.params = { id: parameters.routeId };
        await getRouteController(req, mockRes);
        break;
        
      case "create_route":
        req.body = {
          name: parameters.name,
          start_station: parameters.startStation,
          end_station: parameters.endStation
        };
        await createRouteController(req, mockRes);
        break;
        
      case "update_route":
        req.params = { id: parameters.routeId };
        req.body = {
          name: parameters.name,
          start_station: parameters.startStation,
          end_station: parameters.endStation
        };
        // Remove undefined values
        req.body = Object.fromEntries(
          Object.entries(req.body).filter(([_, value]) => value !== undefined)
        );
        await updateRouteController(req, mockRes);
        break;
        
      case "delete_route":
        req.params = { id: parameters.routeId };
        await deleteRouteController(req, mockRes);
        break;
        
      case "get_community_events":
        await getApprovedEvents(req, mockRes);
        break;
        
      case "get_user_chats":
        await getChatsController(req, mockRes);
        break;
        
      case "get_chat_messages":
        req.params = { chatId: parameters.chatId };
        await getChatMessagesController(req, mockRes);
        break;
        
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }

    return toolResult;
    
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    throw error;
  }
};