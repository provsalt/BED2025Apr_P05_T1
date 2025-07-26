import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getChatMessagesController,
    createMessageController,
    updateMessageController,
    deleteMessageController
} from "../../../controllers/chat/messageController.js";
import * as MessageModel from "../../../models/chat/messageModel.js";
import * as ChatModel from "../../../models/chat/chatModel.js";
import * as Websocket from "../../../utils/websocket.js";

vi.mock("../../../models/chat/messageModel.js", () => ({
    getMessages: vi.fn(),
    createMessage: vi.fn(),
    getMessage: vi.fn(),
    updateMessage: vi.fn(),
    deleteMessage: vi.fn(),
}));

vi.mock("../../../models/chat/chatModel.js", () => ({
    getChat: vi.fn(),
    updateChatTimestamp: vi.fn(),
}));

vi.mock("../../../utils/websocket.js", () => ({
    broadcastMessageCreated: vi.fn(),
    broadcastMessageUpdated: vi.fn(),
    broadcastMessageDeleted: vi.fn(),
}));

describe("Message Controller", () => {
    let req, res;

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            user: { id: 1 },
            params: {},
            body: {}
        };
        res = {
            status: vi.fn(() => res),
            json: vi.fn(),
        };
    });

    describe("getChatMessagesController", () => {
        it("should get all messages for a chat successfully", async () => {
            req.params.chatId = "1";
            const mockMessages = [
                { id: 1, chat_id: 1, msg: "Hello", sender: 1 },
                { id: 2, chat_id: 1, msg: "Hi there", sender: 2 }
            ];
            MessageModel.getMessages.mockResolvedValue(mockMessages);

            await getChatMessagesController(req, res);

            expect(MessageModel.getMessages).toHaveBeenCalledWith(1, "1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMessages);
        });

        it("should return 400 if chatId is missing", async () => {
            req.params.chatId = undefined;

            await getChatMessagesController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat ID is required" });
        });

        it("should return 404 if no messages found", async () => {
            req.params.chatId = "1";
            MessageModel.getMessages.mockResolvedValue(null);

            await getChatMessagesController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "No messages found for this chat" });
        });

        it("should return 404 if messages array is empty", async () => {
            req.params.chatId = "1";
            MessageModel.getMessages.mockResolvedValue([]);

            await getChatMessagesController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "No messages found for this chat" });
        });

        it("should return 500 if there is a server error", async () => {
            req.params.chatId = "1";
            MessageModel.getMessages.mockRejectedValue(new Error("Database error"));

            await getChatMessagesController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("createMessageController", () => {
        beforeEach(() => {
            req.params.chatId = "1";
            req.body.message = "Hello world";
        });

        it("should create a message successfully", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.createMessage.mockResolvedValue(123);
            ChatModel.updateChatTimestamp.mockResolvedValue();
            Websocket.broadcastMessageCreated.mockResolvedValue();

            await createMessageController(req, res);

            expect(ChatModel.getChat).toHaveBeenCalledWith("1");
            expect(MessageModel.createMessage).toHaveBeenCalledWith(1, "Hello world", "1");
            expect(ChatModel.updateChatTimestamp).toHaveBeenCalledWith("1");
            expect(Websocket.broadcastMessageCreated).toHaveBeenCalledWith("1", 123, "Hello world", 1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Message sent successfully",
                messageId: 123
            });
        });

        it("should return 400 if chatId is missing", async () => {
            req.params.chatId = undefined;

            await createMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat ID and message are required" });
        });

        it("should return 400 if message is missing", async () => {
            req.body.message = undefined;

            await createMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat ID and message are required" });
        });

        it("should return 404 if chat not found", async () => {
            ChatModel.getChat.mockResolvedValue(null);

            await createMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat not found" });
        });

        it("should return 403 if user is not authorized to send messages", async () => {
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 4 };
            ChatModel.getChat.mockResolvedValue(mockChat);

            await createMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to send messages in this chat" });
        });

        it("should allow chat recipient to send messages", async () => {
            req.user.id = 2;
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.createMessage.mockResolvedValue(123);
            ChatModel.updateChatTimestamp.mockResolvedValue();
            Websocket.broadcastMessageCreated.mockResolvedValue();

            await createMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("should return 500 if there is a server error", async () => {
            ChatModel.getChat.mockRejectedValue(new Error("Database error"));

            await createMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("updateMessageController", () => {
        beforeEach(() => {
            req.params.chatId = "1";
            req.params.messageId = "123";
            req.body.message = "Updated message";
        });

        it("should update a message successfully", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 1, sender: 1, msg: "Original message" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);
            MessageModel.updateMessage.mockResolvedValue(true);
            ChatModel.updateChatTimestamp.mockResolvedValue();
            Websocket.broadcastMessageUpdated.mockResolvedValue();

            await updateMessageController(req, res);

            expect(MessageModel.updateMessage).toHaveBeenCalledWith("123", "Updated message", 1);
            expect(ChatModel.updateChatTimestamp).toHaveBeenCalledWith("1");
            expect(Websocket.broadcastMessageUpdated).toHaveBeenCalledWith("1", "123", "Updated message", 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Message updated successfully" });
        });

        it("should return 400 if required parameters are missing", async () => {
            req.params.messageId = undefined;

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat ID, message ID, and message are required" });
        });

        it("should return 404 if chat not found", async () => {
            ChatModel.getChat.mockResolvedValue(null);

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat not found" });
        });

        it("should return 403 if user is not authorized to access chat", async () => {
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 4 };
            ChatModel.getChat.mockResolvedValue(mockChat);

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to access this chat" });
        });

        it("should return 404 if message not found", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(null);

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Message not found" });
        });

        it("should return 400 if message does not belong to chat", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 2, sender: 1, msg: "Original message" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Message does not belong to this chat" });
        });

        it("should return 403 if user cannot edit message", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 1, sender: 1, msg: "Original message" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);
            MessageModel.updateMessage.mockResolvedValue(false);

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You can only edit your own messages" });
        });

        it("should return 500 if there is a server error", async () => {
            ChatModel.getChat.mockRejectedValue(new Error("Database error"));

            await updateMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("deleteMessageController", () => {
        beforeEach(() => {
            req.params.chatId = "1";
            req.params.messageId = "123";
        });

        it("should delete a message successfully", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 1, sender: 1, msg: "Message to delete" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);
            MessageModel.deleteMessage.mockResolvedValue(true);
            ChatModel.updateChatTimestamp.mockResolvedValue();
            Websocket.broadcastMessageDeleted.mockResolvedValue();

            await deleteMessageController(req, res);

            expect(MessageModel.deleteMessage).toHaveBeenCalledWith("123", 1);
            expect(ChatModel.updateChatTimestamp).toHaveBeenCalledWith("1");
            expect(Websocket.broadcastMessageDeleted).toHaveBeenCalledWith("1", "123", 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Message deleted successfully" });
        });

        it("should return 400 if required parameters are missing", async () => {
            req.params.messageId = undefined;

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat ID and message ID are required" });
        });

        it("should return 404 if chat not found", async () => {
            ChatModel.getChat.mockResolvedValue(null);

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Chat not found" });
        });

        it("should return 403 if user is not authorized to access chat", async () => {
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 4 };
            ChatModel.getChat.mockResolvedValue(mockChat);

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You are not authorized to access this chat" });
        });

        it("should return 404 if message not found", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(null);

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Message not found" });
        });

        it("should return 400 if message does not belong to chat", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 2, sender: 1, msg: "Message to delete" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Message does not belong to this chat" });
        });

        it("should return 403 if user cannot delete message", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 1, sender: 1, msg: "Message to delete" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);
            MessageModel.deleteMessage.mockResolvedValue(false);

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "You can only delete your own messages" });
        });

        it("should return 500 if there is a server error", async () => {
            ChatModel.getChat.mockRejectedValue(new Error("Database error"));

            await deleteMessageController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });
});