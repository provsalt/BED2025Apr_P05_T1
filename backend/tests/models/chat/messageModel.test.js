import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getMessages,
    createMessage,
    getMessage,
    updateMessage,
    deleteMessage
} from "../../../models/chat/messageModel.js";
import * as ChatModel from "../../../models/chat/chatModel.js";
import sql from "mssql";

vi.mock("mssql", () => ({
    default: {
        connect: vi.fn(),
    },
}));

vi.mock("../../../models/chat/chatModel.js", () => ({
    getChat: vi.fn(),
}));

vi.mock("../../../config/db.js", () => ({
    dbConfig: { server: "test", database: "test" },
}));

describe("Message Model", () => {
    let mockDb, mockRequest;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = {
            input: vi.fn(() => mockRequest),
            query: vi.fn(),
        };
        mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);
    });

    describe("getMessages", () => {
        it("should get messages for authorized user (chat initiator)", async () => {
            const userId = 1;
            const chatId = 1;
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessages = [
                { id: 1, chat_id: 1, msg: "Hello", sender: 1 },
                { id: 2, chat_id: 1, msg: "Hi there", sender: 2 }
            ];

            ChatModel.getChat.mockResolvedValue(mockChat);
            mockRequest.query.mockResolvedValue({ recordset: mockMessages });

            const result = await getMessages(userId, chatId);

            expect(ChatModel.getChat).toHaveBeenCalledWith(chatId);
            expect(mockRequest.input).toHaveBeenCalledWith("chat_id", chatId);
            expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM ChatMsg WHERE chat_id = @chat_id");
            expect(result).toEqual(mockMessages);
        });

        it("should get messages for authorized user (chat recipient)", async () => {
            const userId = 2;
            const chatId = 1;
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockMessages = [
                { id: 1, chat_id: 1, msg: "Hello", sender: 1 }
            ];

            ChatModel.getChat.mockResolvedValue(mockChat);
            mockRequest.query.mockResolvedValue({ recordset: mockMessages });

            const result = await getMessages(userId, chatId);

            expect(result).toEqual(mockMessages);
        });

        it("should return null if chat does not exist", async () => {
            const userId = 1;
            const chatId = 999;

            ChatModel.getChat.mockResolvedValue(null);

            const result = await getMessages(userId, chatId);

            expect(result).toBeNull();
            expect(sql.connect).not.toHaveBeenCalled();
        });

        it("should return null if user is not authorized", async () => {
            const userId = 3;
            const chatId = 1;
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };

            ChatModel.getChat.mockResolvedValue(mockChat);

            const result = await getMessages(userId, chatId);

            expect(result).toBeNull();
            expect(sql.connect).not.toHaveBeenCalled();
        });

        it("should return null if no messages found", async () => {
            const userId = 1;
            const chatId = 1;
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };

            ChatModel.getChat.mockResolvedValue(mockChat);
            mockRequest.query.mockResolvedValue({ recordset: [] });

            const result = await getMessages(userId, chatId);

            expect(result).toBeNull();
        });
    });

    describe("createMessage", () => {
        it("should create a message successfully", async () => {
            const senderId = 1;
            const message = "Hello world";
            const chatId = 1;
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockResult = { recordset: [{ id: 123 }] };

            ChatModel.getChat.mockResolvedValue(mockChat);
            mockRequest.query.mockResolvedValue(mockResult);

            const result = await createMessage(senderId, message, chatId);

            expect(ChatModel.getChat).toHaveBeenCalledWith(chatId);
            expect(mockRequest.input).toHaveBeenCalledWith("chatId", chatId);
            expect(mockRequest.input).toHaveBeenCalledWith("message", message);
            expect(mockRequest.input).toHaveBeenCalledWith("senderId", senderId);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO ChatMsg"));
            expect(result).toBe(123);
        });

        it("should return false if chat does not exist", async () => {
            const senderId = 1;
            const message = "Hello world";
            const chatId = 999;

            ChatModel.getChat.mockResolvedValue(null);

            const result = await createMessage(senderId, message, chatId);

            expect(result).toBe(false);
            expect(sql.connect).not.toHaveBeenCalled();
        });

        it("should handle database insertion with correct query", async () => {
            const senderId = 1;
            const message = "Test message";
            const chatId = 1;
            const mockChat = { id: 1, chat_initiator: 1, chat_recipient: 2 };
            const mockResult = { recordset: [{ id: 456 }] };

            ChatModel.getChat.mockResolvedValue(mockChat);
            mockRequest.query.mockResolvedValue(mockResult);

            await createMessage(senderId, message, chatId);

            const expectedQuery = `
    INSERT INTO ChatMsg (chat_id, msg, sender, msg_created_at)
    VALUES (@chatId, @message, @senderId, GETDATE());
    SELECT SCOPE_IDENTITY() AS id;
  `;
            expect(mockRequest.query).toHaveBeenCalledWith(expectedQuery);
        });
    });

    describe("getMessage", () => {
        it("should get a message by ID successfully", async () => {
            const messageId = 123;
            const mockMessage = { id: 123, chat_id: 1, msg: "Hello", sender: 1 };
            mockRequest.query.mockResolvedValue({ recordset: [mockMessage] });

            const result = await getMessage(messageId);

            expect(mockRequest.input).toHaveBeenCalledWith("messageId", messageId);
            expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM ChatMsg WHERE id = @messageId");
            expect(result).toEqual(mockMessage);
        });

        it("should return null if message not found", async () => {
            const messageId = 999;
            mockRequest.query.mockResolvedValue({ recordset: [] });

            const result = await getMessage(messageId);

            expect(result).toBeNull();
        });

        it("should handle database connection and query correctly", async () => {
            const messageId = 123;
            mockRequest.query.mockResolvedValue({ recordset: [] });

            await getMessage(messageId);

            expect(sql.connect).toHaveBeenCalled();
            expect(mockDb.request).toHaveBeenCalled();
            expect(mockRequest.input).toHaveBeenCalledWith("messageId", messageId);
        });
    });

    describe("updateMessage", () => {
        it("should update a message successfully", async () => {
            const messageId = 123;
            const newMessage = "Updated message";
            const userId = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            const result = await updateMessage(messageId, newMessage, userId);

            expect(mockRequest.input).toHaveBeenCalledWith("messageId", messageId);
            expect(mockRequest.input).toHaveBeenCalledWith("newMessage", newMessage);
            expect(mockRequest.input).toHaveBeenCalledWith("userId", userId);
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE ChatMsg"));
            expect(result).toBe(true);
        });

        it("should return false if no rows affected (unauthorized or not found)", async () => {
            const messageId = 123;
            const newMessage = "Updated message";
            const userId = 2;
            mockRequest.query.mockResolvedValue({ rowsAffected: [0] });

            const result = await updateMessage(messageId, newMessage, userId);

            expect(result).toBe(false);
        });

        it("should use correct SQL query with user authorization", async () => {
            const messageId = 123;
            const newMessage = "Updated message";
            const userId = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            await updateMessage(messageId, newMessage, userId);

            const expectedQuery = `
    UPDATE ChatMsg 
    SET msg = @newMessage 
    WHERE id = @messageId AND sender = @userId
  `;
            expect(mockRequest.query).toHaveBeenCalledWith(expectedQuery);
        });

        it("should handle multiple rows affected correctly", async () => {
            const messageId = 123;
            const newMessage = "Updated message";
            const userId = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [2] });

            const result = await updateMessage(messageId, newMessage, userId);

            expect(result).toBe(true);
        });
    });

    describe("deleteMessage", () => {
        it("should delete a message successfully", async () => {
            const messageId = 123;
            const userId = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            const result = await deleteMessage(messageId, userId);

            expect(mockRequest.input).toHaveBeenCalledWith("messageId", messageId);
            expect(mockRequest.input).toHaveBeenCalledWith("userId", userId);
            expect(mockRequest.query).toHaveBeenCalledWith("DELETE FROM ChatMsg WHERE id = @messageId AND sender = @userId");
            expect(result).toBe(true);
        });

        it("should return false if no rows affected (unauthorized or not found)", async () => {
            const messageId = 123;
            const userId = 2;
            mockRequest.query.mockResolvedValue({ rowsAffected: [0] });

            const result = await deleteMessage(messageId, userId);

            expect(result).toBe(false);
        });

        it("should handle database connection correctly", async () => {
            const messageId = 123;
            const userId = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            await deleteMessage(messageId, userId);

            expect(sql.connect).toHaveBeenCalled();
            expect(mockDb.request).toHaveBeenCalled();
        });

        it("should only delete messages owned by the user", async () => {
            const messageId = 123;
            const userId = 1;
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

            await deleteMessage(messageId, userId);

            expect(mockRequest.query).toHaveBeenCalledWith("DELETE FROM ChatMsg WHERE id = @messageId AND sender = @userId");
        });
    });

    describe("Database error handling", () => {
        it("should propagate database connection errors", async () => {
            const error = new Error("Connection failed");
            sql.connect.mockRejectedValue(error);

            await expect(getMessage(123)).rejects.toThrow("Connection failed");
        });

        it("should propagate query execution errors", async () => {
            const error = new Error("Query failed");
            mockRequest.query.mockRejectedValue(error);

            await expect(getMessage(123)).rejects.toThrow("Query failed");
        });
    });
});