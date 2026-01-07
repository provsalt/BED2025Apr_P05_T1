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
import { ErrorFactory } from "../../../utils/AppError.js";

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

vi.mock("../../../utils/AppError.js", () => ({
    ErrorFactory: {
        notFound: vi.fn((resource) => new Error(`${resource} not found`)),
        validation: vi.fn((message) => new Error(message)),
        forbidden: vi.fn((message) => new Error(message)),
    }
}));

describe("Message Controller", () => {
    let req, res;

    let next;

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
        next = vi.fn();
    });

    describe("getChatMessagesController", () => {
        it("should get all messages for a chat successfully", async () => {
            req.params.chatId = "1";
            const mockMessages = [
                { id: 1, chat_id: 1, msg: "Hello", sender: 1 },
                { id: 2, chat_id: 1, msg: "Hi there", sender: 2 }
            ];
            MessageModel.getMessages.mockResolvedValue(mockMessages);

            await getChatMessagesController(req, res, next);

            expect(MessageModel.getMessages).toHaveBeenCalledWith(1, "1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMessages);
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if chatId is missing", async () => {
            req.params.chatId = undefined;

            await getChatMessagesController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Chat ID is required");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if no messages found", async () => {
            req.params.chatId = "1";
            MessageModel.getMessages.mockResolvedValue(null);

            await getChatMessagesController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Messages for this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if messages array is empty", async () => {
            req.params.chatId = "1";
            MessageModel.getMessages.mockResolvedValue([]);

            await getChatMessagesController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Messages for this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with error if there is a server error", async () => {
            req.params.chatId = "1";
            const serverError = new Error("Database error");
            MessageModel.getMessages.mockRejectedValue(serverError);

            await getChatMessagesController(req, res, next);

            expect(next).toHaveBeenCalledWith(serverError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
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

            await createMessageController(req, res, next);

            expect(ChatModel.getChat).toHaveBeenCalledWith("1");
            expect(MessageModel.createMessage).toHaveBeenCalledWith(1, "Hello world", "1");
            expect(ChatModel.updateChatTimestamp).toHaveBeenCalledWith("1");
            expect(Websocket.broadcastMessageCreated).toHaveBeenCalledWith("1", 123, "Hello world", 1, {
                initiatorId: 1,
                recipientId: 2
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Message sent successfully",
                messageId: 123
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if chatId is missing", async () => {
            req.params.chatId = undefined;

            await createMessageController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Chat ID and message are required");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if message is missing", async () => {
            req.body.message = undefined;

            await createMessageController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Chat ID and message are required");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if chat not found", async () => {
            ChatModel.getChat.mockResolvedValue(null);

            await createMessageController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with forbidden AppError if user is not authorized to send messages", async () => {
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 4 };
            ChatModel.getChat.mockResolvedValue(mockChat);

            await createMessageController(req, res, next);

            expect(ErrorFactory.forbidden).toHaveBeenCalledWith("You are not authorized to send messages in this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should allow chat recipient to send messages", async () => {
            req.user.id = 2;
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.createMessage.mockResolvedValue(123);
            ChatModel.updateChatTimestamp.mockResolvedValue();
            Websocket.broadcastMessageCreated.mockResolvedValue();

            await createMessageController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with error if there is a server error", async () => {
            const serverError = new Error("Database error");
            ChatModel.getChat.mockRejectedValue(serverError);

            await createMessageController(req, res, next);

            expect(next).toHaveBeenCalledWith(serverError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
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

            await updateMessageController(req, res, next);

            expect(MessageModel.updateMessage).toHaveBeenCalledWith("123", "Updated message", 1);
            expect(ChatModel.updateChatTimestamp).toHaveBeenCalledWith("1");
            expect(Websocket.broadcastMessageUpdated).toHaveBeenCalledWith("1", "123", "Updated message", 1, {
                initiatorId: 1,
                recipientId: 2
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Message updated successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if required parameters are missing", async () => {
            req.params.messageId = undefined;

            await updateMessageController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Chat ID, message ID, and message are required");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if chat not found", async () => {
            ChatModel.getChat.mockResolvedValue(null);

            await updateMessageController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with forbidden AppError if user is not authorized to access chat", async () => {
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 4 };
            ChatModel.getChat.mockResolvedValue(mockChat);

            await updateMessageController(req, res, next);

            expect(ErrorFactory.forbidden).toHaveBeenCalledWith("You are not authorized to access this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if message not found", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(null);

            await updateMessageController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Message");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if message does not belong to chat", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 2, sender: 1, msg: "Original message" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);

            await updateMessageController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Message does not belong to this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with forbidden AppError if user cannot edit message", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 1, sender: 1, msg: "Original message" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);
            MessageModel.updateMessage.mockResolvedValue(false);

            await updateMessageController(req, res, next);

            expect(ErrorFactory.forbidden).toHaveBeenCalledWith("You can only edit your own messages");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with error if there is a server error", async () => {
            const serverError = new Error("Database error");
            ChatModel.getChat.mockRejectedValue(serverError);

            await updateMessageController(req, res, next);

            expect(next).toHaveBeenCalledWith(serverError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
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

            await deleteMessageController(req, res, next);

            expect(MessageModel.deleteMessage).toHaveBeenCalledWith("123", 1);
            expect(ChatModel.updateChatTimestamp).toHaveBeenCalledWith("1");
            expect(Websocket.broadcastMessageDeleted).toHaveBeenCalledWith("1", "123", 1, {
                initiatorId: 1,
                recipientId: 2
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Message deleted successfully" });
            expect(next).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if required parameters are missing", async () => {
            req.params.messageId = undefined;

            await deleteMessageController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Chat ID and message ID are required");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if chat not found", async () => {
            ChatModel.getChat.mockResolvedValue(null);

            await deleteMessageController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with forbidden AppError if user is not authorized to access chat", async () => {
            const mockChat = { id: 1, chat_initiator: 3, chat_recipient: 4 };
            ChatModel.getChat.mockResolvedValue(mockChat);

            await deleteMessageController(req, res, next);

            expect(ErrorFactory.forbidden).toHaveBeenCalledWith("You are not authorized to access this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with notFound AppError if message not found", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(null);

            await deleteMessageController(req, res, next);

            expect(ErrorFactory.notFound).toHaveBeenCalledWith("Message");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with validation AppError if message does not belong to chat", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 2, sender: 1, msg: "Message to delete" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);

            await deleteMessageController(req, res, next);

            expect(ErrorFactory.validation).toHaveBeenCalledWith("Message does not belong to this chat");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with forbidden AppError if user cannot delete message", async () => {
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessage = { id: 123, chat_id: 1, sender: 1, msg: "Message to delete" };
            ChatModel.getChat.mockResolvedValue(mockChat);
            MessageModel.getMessage.mockResolvedValue(mockMessage);
            MessageModel.deleteMessage.mockResolvedValue(false);

            await deleteMessageController(req, res, next);

            expect(ErrorFactory.forbidden).toHaveBeenCalledWith("You can only delete your own messages");
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it("should call next with error if there is a server error", async () => {
            const serverError = new Error("Database error");
            ChatModel.getChat.mockRejectedValue(serverError);

            await deleteMessageController(req, res, next);

            expect(next).toHaveBeenCalledWith(serverError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});