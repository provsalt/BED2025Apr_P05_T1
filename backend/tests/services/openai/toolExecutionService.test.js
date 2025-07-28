import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeAITool } from "../../../services/openai/toolExecutionService.js";

vi.mock("../../../controllers/user/userController.js", () => ({
    getCurrentUserController: vi.fn(),
}));

vi.mock("../../../controllers/medical/medicalController.js", () => ({
    getMedicationReminders: vi.fn(),
}));

vi.mock("../../../controllers/nutrition/mealImageController.js", () => ({
    retrieveMeals: vi.fn(),
    searchMealsController: vi.fn(),
    retrieveMealsById: vi.fn(),
    amendMeal: vi.fn(),
    removeMeal: vi.fn(),
}));

vi.mock("../../../controllers/transport/transportController.js", () => ({
    getStationCodeNameMap: vi.fn(),
    getShortestPath: vi.fn(),
}));

vi.mock("../../../controllers/transport/routeController.js", () => ({
    createRouteController: vi.fn(),
    getUserRoutesController: vi.fn(),
    getRouteController: vi.fn(),
    updateRouteController: vi.fn(),
    deleteRouteController: vi.fn(),
}));

vi.mock("../../../controllers/community/communityEventController.js", () => ({
    getApprovedEvents: vi.fn(),
}));

vi.mock("../../../controllers/chat/chatController.js", () => ({
    getChatsController: vi.fn(),
}));

vi.mock("../../../controllers/chat/messageController.js", () => ({
    getChatMessagesController: vi.fn(),
}));

describe("Tool Execution Service", () => {
    let mockUser;

    beforeEach(() => {
        mockUser = {
            id: 1,
            username: "testuser",
            email: "test@example.com",
            role: "user"
        };
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("get_current_date", () => {
        it("should return current date information", async () => {
            const result = await executeAITool("get_current_date", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(result.data).toHaveProperty("currentDate");
            expect(result.data).toHaveProperty("currentDateFormatted");
            expect(result.data).toHaveProperty("currentTime");
            expect(result.data).toHaveProperty("timezone");
            expect(result.data).toHaveProperty("dayOfWeek");
            expect(result.data).toHaveProperty("dayOfMonth");
            expect(result.data).toHaveProperty("month");
            expect(result.data).toHaveProperty("year");

            expect(typeof result.data.currentDate).toBe("string");
            expect(typeof result.data.currentDateFormatted).toBe("string");
            expect(typeof result.data.currentTime).toBe("string");
            expect(typeof result.data.timezone).toBe("string");
            expect(typeof result.data.dayOfWeek).toBe("number");
            expect(typeof result.data.dayOfMonth).toBe("number");
            expect(typeof result.data.month).toBe("number");
            expect(typeof result.data.year).toBe("number");
        });
    });

    describe("get_user_details", () => {
        it("should return user details successfully", async () => {
            const { getCurrentUserController } = await import("../../../controllers/user/userController.js");
            vi.mocked(getCurrentUserController).mockImplementation(async (req, res) => {
                res.status(200).json({
                    id: 1,
                    username: "testuser",
                    email: "test@example.com"
                });
            });

            const result = await executeAITool("get_user_details", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(result.data.id).toBe(1);
            expect(result.data.username).toBe("testuser");
        });

        it("should handle controller errors", async () => {
            const { getCurrentUserController } = await import("../../../controllers/user/userController.js");
            vi.mocked(getCurrentUserController).mockImplementation(async (req, res) => {
                res.status(500).json({ message: "Internal server error" });
            });

            const result = await executeAITool("get_user_details", {}, mockUser);

            expect(result.statusCode).toBe(500);
            expect(result.data.message).toBe("Internal server error");
        });
    });

    describe("get_medication_reminders", () => {
        it("should return medication reminders successfully", async () => {
            const { getMedicationReminders } = await import("../../../controllers/medical/medicalController.js");
            vi.mocked(getMedicationReminders).mockImplementation(async (req, res) => {
                res.status(200).json([
                    { id: 1, medication_name: "Aspirin", dosage: "100mg", frequency: "daily" },
                    { id: 2, medication_name: "Ibuprofen", dosage: "200mg", frequency: "as needed" }
                ]);
            });

            const result = await executeAITool("get_medication_reminders", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
        });

        it("should handle no reminders found", async () => {
            const { getMedicationReminders } = await import("../../../controllers/medical/medicalController.js");
            vi.mocked(getMedicationReminders).mockImplementation(async (req, res) => {
                res.status(200).json([]);
            });

            const result = await executeAITool("get_medication_reminders", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(result.data).toEqual([]);
        });
    });

    describe("get_meals", () => {
        it("should return user meals successfully", async () => {
            const { retrieveMeals } = await import("../../../controllers/nutrition/mealImageController.js");
            vi.mocked(retrieveMeals).mockImplementation(async (req, res) => {
                res.status(200).json([
                    { id: 1, meal_name: "Breakfast", calories: 350, meal_date: "2023-12-01" },
                    { id: 2, meal_name: "Lunch", calories: 450, meal_date: "2023-12-01" }
                ]);
            });

            const result = await executeAITool("get_meals", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
        });

        it("should handle empty meals list", async () => {
            const { retrieveMeals } = await import("../../../controllers/nutrition/mealImageController.js");
            vi.mocked(retrieveMeals).mockImplementation(async (req, res) => {
                res.status(200).json([]);
            });

            const result = await executeAITool("get_meals", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(result.data).toEqual([]);
        });
    });

    describe("get_user_chats", () => {
        it("should return user chats successfully", async () => {
            const { getChatsController } = await import("../../../controllers/chat/chatController.js");
            vi.mocked(getChatsController).mockImplementation(async (req, res) => {
                res.status(200).json([
                    { id: 1, chat_initiator: 1, chat_recipient: 2, last_message: "Hello" },
                    { id: 2, chat_initiator: 3, chat_recipient: 1, last_message: "Hi there" }
                ]);
            });

            const result = await executeAITool("get_user_chats", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
        });
    });

    describe("get_community_events", () => {
        it("should return community events successfully", async () => {
            const { getApprovedEvents } = await import("../../../controllers/community/communityEventController.js");
            vi.mocked(getApprovedEvents).mockImplementation(async (req, res) => {
                res.status(200).json([
                    { id: 1, title: "Health Workshop", date: "2023-12-15", location: "Community Center" },
                    { id: 2, title: "Fitness Class", date: "2023-12-20", location: "Gym" }
                ]);
            });

            const result = await executeAITool("get_community_events", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
        });
    });

    describe("get_user_routes", () => {
        it("should return user routes successfully", async () => {
            const { getUserRoutesController } = await import("../../../controllers/transport/routeController.js");
            vi.mocked(getUserRoutesController).mockImplementation(async (req, res) => {
                res.status(200).json([
                    { id: 1, route_name: "Route A", start_location: "Home", end_location: "Hospital" },
                    { id: 2, route_name: "Route B", start_location: "Home", end_location: "Pharmacy" }
                ]);
            });

            const result = await executeAITool("get_user_routes", {}, mockUser);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data).toHaveLength(2);
        });
    });

    describe("unknown function", () => {
        it("should throw error for unknown function", async () => {
            await expect(executeAITool("unknown_function", {}, mockUser))
                .rejects.toThrow("Unknown function: unknown_function");
        });
    });

    describe("error handling", () => {
        it("should handle null user", async () => {
            const { getCurrentUserController } = await import("../../../controllers/user/userController.js");
            vi.mocked(getCurrentUserController).mockImplementation(async (req, res) => {
                res.status(401).json({ message: "Unauthorized" });
            });

            const result = await executeAITool("get_user_details", {}, null);
            expect(result.statusCode).toBe(401);
        });

        it("should handle undefined user", async () => {
            const { getCurrentUserController } = await import("../../../controllers/user/userController.js");
            vi.mocked(getCurrentUserController).mockImplementation(async (req, res) => {
                res.status(401).json({ message: "Unauthorized" });
            });

            const result = await executeAITool("get_user_details", {}, undefined);
            expect(result.statusCode).toBe(401);
        });

        it("should handle user without id", async () => {
            const invalidUser = { username: "test" };
            const { getCurrentUserController } = await import("../../../controllers/user/userController.js");
            vi.mocked(getCurrentUserController).mockImplementation(async (req, res) => {
                res.status(401).json({ message: "Unauthorized" });
            });

            const result = await executeAITool("get_user_details", {}, invalidUser);
            expect(result.statusCode).toBe(401);
        });
    });

    describe("parameter validation", () => {
        it("should handle search meals with search term", async () => {
            const { searchMealsController } = await import("../../../controllers/nutrition/mealImageController.js");
            vi.mocked(searchMealsController).mockImplementation(async (req, res) => {
                res.status(200).json([{ id: 1, meal_name: "Breakfast" }]);
            });

            const result = await executeAITool("search_meals", { searchTerm: "breakfast" }, mockUser);

            expect(result.statusCode).toBe(200);
            expect(Array.isArray(result.data)).toBe(true);
        });

        it("should handle get meal details with meal ID", async () => {
            const { retrieveMealsById } = await import("../../../controllers/nutrition/mealImageController.js");
            vi.mocked(retrieveMealsById).mockImplementation(async (req, res) => {
                res.status(200).json({ id: 1, meal_name: "Breakfast", calories: 350 });
            });

            const result = await executeAITool("get_meal_details", { mealId: 1 }, mockUser);

            expect(result.statusCode).toBe(200);
            expect(result.data.id).toBe(1);
        });
    });
});