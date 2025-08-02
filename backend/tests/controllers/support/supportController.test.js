import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { chatWithAI } from "../../../controllers/support/supportController.js";
import * as aiSupportService from "../../../services/openai/aiSupportService.js";
import * as toolExecutionService from "../../../services/openai/toolExecutionService.js";

vi.mock("../../../services/openai/aiSupportService.js", () => ({
    generateAIResponse: vi.fn(),
}));

vi.mock("../../../services/openai/toolExecutionService.js", () => ({
    executeAITool: vi.fn(),
}));

describe("Support Controller", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { id: 1, username: "testuser" },
            body: {}
        };
        res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("chatWithAI", () => {
        it("should return AI response for valid conversation", async () => {
            const conversation = [
                { role: "user", content: "Hello, I need help with my medication" }
            ];
            const context = "medical";
            const expectedResponse = {
                response: "I'd be happy to help with your medication. What specific assistance do you need?",
                toolsUsed: []
            };

            req.body = { conversation, context };
            aiSupportService.generateAIResponse.mockResolvedValue(expectedResponse);

            await chatWithAI(req, res, next);

            expect(aiSupportService.generateAIResponse).toHaveBeenCalledWith(
                conversation,
                context,
                expect.any(Function),
                1
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });

        it("should handle conversation with tool execution", async () => {
            const conversation = [
                { role: "user", content: "What medications do I have?" }
            ];
            const context = "medical";
            const toolResult = { statusCode: 200, data: [{ name: "Aspirin", dosage: "100mg" }] };
            const expectedResponse = {
                response: "Based on your medication records, you currently have Aspirin 100mg prescribed.",
                toolsUsed: [{ function: "get_user_medications", result: toolResult }]
            };

            req.body = { conversation, context };
            toolExecutionService.executeAITool.mockResolvedValue(toolResult);
            aiSupportService.generateAIResponse.mockResolvedValue(expectedResponse);

            await chatWithAI(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });

        it("should handle multi-turn conversation", async () => {
            const conversation = [
                { role: "user", content: "Hello" },
                { role: "assistant", content: "Hi! How can I help you today?" },
                { role: "user", content: "I want to check my nutrition data" }
            ];
            const context = "nutrition";
            const expectedResponse = {
                response: "I'll help you check your nutrition data. Let me retrieve your recent meals.",
                toolsUsed: []
            };

            req.body = { conversation, context };
            aiSupportService.generateAIResponse.mockResolvedValue(expectedResponse);

            await chatWithAI(req, res, next);

            expect(aiSupportService.generateAIResponse).toHaveBeenCalledWith(
                conversation,
                context,
                expect.any(Function),
                1
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });

        it("should return 500 if AI service throws an error", async () => {
            const conversation = [{ role: "user", content: "Hello" }];
            const context = "general";

            req.body = { conversation, context };
            aiSupportService.generateAIResponse.mockRejectedValue(new Error("OpenAI API error"));

            await chatWithAI(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                name: "AppError",
                statusCode: 503,
                category: "external_service"
            }));
        });

        it("should return 500 if tool execution fails", async () => {
            const conversation = [{ role: "user", content: "Get my medications" }];
            const context = "medical";

            req.body = { conversation, context };
            toolExecutionService.executeAITool.mockRejectedValue(new Error("Database connection failed"));
            aiSupportService.generateAIResponse.mockRejectedValue(new Error("Tool execution failed"));

            await chatWithAI(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                name: "AppError",
                statusCode: 503,
                category: "external_service"
            }));
        });

        it("should handle context parameter correctly", async () => {
            const testCases = [
                { context: "general", conversation: [{ role: "user", content: "Hello" }] },
                { context: "medical", conversation: [{ role: "user", content: "Check my health" }] },
                { context: "nutrition", conversation: [{ role: "user", content: "Show my meals" }] },
                { context: "transport", conversation: [{ role: "user", content: "Find routes" }] },
                { context: "community", conversation: [{ role: "user", content: "Show events" }] },
                { context: "chat", conversation: [{ role: "user", content: "Message someone" }] }
            ];

            for (const testCase of testCases) {
                req.body = testCase;
                const expectedResponse = { response: "Test response", toolsUsed: [] };
                aiSupportService.generateAIResponse.mockResolvedValue(expectedResponse);

                await chatWithAI(req, res, next);

                expect(aiSupportService.generateAIResponse).toHaveBeenCalledWith(
                    testCase.conversation,
                    testCase.context,
                    expect.any(Function),
                    1
                );
                vi.clearAllMocks();
            }
        });

        it("should pass user context to tool executor", async () => {
            const conversation = [{ role: "user", content: "Get my data" }];
            const context = "general";
            const mockUser = { id: 1, username: "testuser", email: "test@example.com" };

            req.user = mockUser;
            req.body = { conversation, context };

            const expectedResponse = { response: "Data retrieved", toolsUsed: [] };
            aiSupportService.generateAIResponse.mockImplementation(async (conv, ctx, toolExecutor) => {
                await toolExecutor("test_function", { param: "value" });
                return expectedResponse;
            });

            await chatWithAI(req, res, next);

            expect(toolExecutionService.executeAITool).toHaveBeenCalledWith(
                "test_function",
                { param: "value" },
                mockUser
            );
        });

        it("should handle empty conversation array gracefully", async () => {
            req.body = { conversation: [], context: "general" };
            
            aiSupportService.generateAIResponse.mockRejectedValue(new Error("Empty conversation"));

            await chatWithAI(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                name: "AppError",
                statusCode: 503,
                category: "external_service"
            }));
        });

        it("should handle missing context parameter", async () => {
            const conversation = [{ role: "user", content: "Hello" }];
            req.body = { conversation };

            const expectedResponse = { response: "Hello! How can I help?", toolsUsed: [] };
            aiSupportService.generateAIResponse.mockResolvedValue(expectedResponse);

            await chatWithAI(req, res, next);

            expect(aiSupportService.generateAIResponse).toHaveBeenCalledWith(
                conversation,
                undefined,
                expect.any(Function),
                1
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should handle errors and call next with AppError", async () => {
            const testError = new Error("Test error");
            
            req.body = {
                conversation: [{ role: "user", content: "Hello" }],
                context: "general"
            };
            aiSupportService.generateAIResponse.mockRejectedValue(testError);

            await chatWithAI(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                name: "AppError",
                statusCode: 503,
                category: "external_service",
                userMessage: "Failed to get AI response"
            }));
        });
    });
});