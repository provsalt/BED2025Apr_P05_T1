import { describe, it, expect, vi } from "vitest";
import { getChatsController, createChatController } from "../../../controllers/chat/chatController.js";
import * as ChatModel from "../../../models/chat/chatModel.js";
import * as MessageModel from "../../../models/chat/messageModel.js";
import * as Websocket from "../../../utils/websocket.js";
import { ErrorFactory } from "../../../utils/AppError.js";

vi.mock("../../../models/chat/chatModel.js", () => ({
    getChats: vi.fn(),
    createChat: vi.fn(),
    getChatBetweenUsers: vi.fn(),
}));
vi.mock("../../../models/chat/messageModel.js", () => ({
    createMessage: vi.fn(),
}));
vi.mock("../../../utils/websocket.js", () => ({
    broadcastMessageCreated: vi.fn(),
}));

vi.mock("../../../utils/AppError.js", () => ({
    ErrorFactory: {
        notFound: vi.fn((resource) => new Error(`${resource} not found`)),
        validation: vi.fn((message) => new Error(message)),
        conflict: vi.fn((message, userMessage) => new Error(message)),
    }
}));

describe("Chat Controller", () => {
    it("should get all chats for a user", async () => {
        const req = { user: { id: 1 } };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();
        ChatModel.getChats.mockResolvedValue([{ id: 1, chat_initiator: 1, chat_recipient: 2 }]);

        await getChatsController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ id: 1, chat_initiator: 1, chat_recipient: 2 }]);
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next with AppError if no chats are found", async () => {
        const req = { user: { id: 1 } };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();
        ChatModel.getChats.mockResolvedValue(null);

        await getChatsController(req, res, next);

        expect(ErrorFactory.notFound).toHaveBeenCalledWith("Chats");
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should create a new chat", async () => {
        const req = {
            user: { id: 1 },
            body: { recipientId: 2, message: "Hello" },
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();
        ChatModel.getChatBetweenUsers.mockResolvedValue(null);
        ChatModel.createChat.mockResolvedValue(1);
        MessageModel.createMessage.mockResolvedValue(1);
        Websocket.broadcastMessageCreated.mockResolvedValue();

        await createChatController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "Chat created successfully", chatId: 1 });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next with conflict AppError if chat already exists", async () => {
        const req = {
            user: { id: 1 },
            body: { recipientId: 2, message: "Hello" },
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();
        ChatModel.getChatBetweenUsers.mockResolvedValue({ id: 1 });

        await createChatController(req, res, next);

        expect(ErrorFactory.conflict).toHaveBeenCalledWith(
            "Chat already exists between these users",
            "Chat already exists. Chat ID: 1"
        );
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });


    it("should call next with validation AppError if recipientId or message is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {},
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();

        await createChatController(req, res, next);

        expect(ErrorFactory.validation).toHaveBeenCalledWith("recipientId and message are required");
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with error if there is a server error", async () => {
        const req = {
            user: { id: 1 },
            body: { recipientId: 2, message: "Hello" },
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();
        const serverError = new Error("Server error");
        ChatModel.getChatBetweenUsers.mockRejectedValue(serverError);

        await createChatController(req, res, next);

        expect(next).toHaveBeenCalledWith(serverError);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError if user tries to chat with themselves", async () => {
        const req = {
            user: { id: 1 },
            body: { recipientId: 1, message: "Hello" },
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        const next = vi.fn();

        await createChatController(req, res, next);

        expect(ErrorFactory.validation).toHaveBeenCalledWith("You cannot chat with yourself");
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
