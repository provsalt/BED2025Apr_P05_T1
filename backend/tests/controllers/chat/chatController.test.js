import { describe, it, expect, vi } from "vitest";
import { getChatsController, createChatController } from "../../../controllers/chat/chatController.js";
import * as ChatModel from "../../../models/chat/chatModel.js";
import * as MessageModel from "../../../models/chat/messageModel.js";
import * as Websocket from "../../../utils/websocket.js";

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

describe("Chat Controller", () => {
    it("should get all chats for a user", async () => {
        const req = { user: { id: 1 } };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        ChatModel.getChats.mockResolvedValue([{ id: 1, chat_initiator: 1, chat_recipient: 2 }]);

        await getChatsController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ id: 1, chat_initiator: 1, chat_recipient: 2 }]);
    });

    it("should return 404 if no chats are found", async () => {
        const req = { user: { id: 1 } };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        ChatModel.getChats.mockResolvedValue(null);

        await getChatsController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No chats yet" });
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
        ChatModel.getChatBetweenUsers.mockResolvedValue(null);
        ChatModel.createChat.mockResolvedValue(1);
        MessageModel.createMessage.mockResolvedValue(1);
        Websocket.broadcastMessageCreated.mockResolvedValue();

        await createChatController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "Chat created successfully", chatId: 1 });
    });

    it("should return 409 if chat already exists", async () => {
        const req = {
            user: { id: 1 },
            body: { recipientId: 2, message: "Hello" },
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        ChatModel.getChatBetweenUsers.mockResolvedValue({ id: 1 });

        await createChatController(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: "Chat already exists between these users", chatId: 1 });
    });


    it("should return 400 if recipientId or message is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {},
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };

        await createChatController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "recipientId and message are required" });
    });

    it("should return 500 if there is a server error", async () => {
        const req = {
            user: { id: 1 },
            body: { recipientId: 2, message: "Hello" },
        };
        const res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
        ChatModel.getChatBetweenUsers.mockRejectedValue(new Error("Server error"));

        await createChatController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
});
