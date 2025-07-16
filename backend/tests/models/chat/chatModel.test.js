import { describe, it, expect, vi } from 'vitest';
import { createChat, getChats, getChat, getChatBetweenUsers, updateChatTimestamp } from '../../../models/chat/chatModel.js';
import sql from 'mssql';

vi.mock('mssql', () => ({
  default: {
    connect: vi.fn(),
  }
}));

describe('Chat Model', () => {
    it('should create a new chat', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [{ id: 1 }] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const initiatorId = 1;
        const recipientId = 2;
        const newChatId = await createChat(initiatorId, recipientId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockDb.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith('initiatorId', initiatorId);
        expect(mockRequest.input).toHaveBeenCalledWith('recipientId', recipientId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(newChatId).toBe(1);
    });

    it('should get all chats for a user', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [{ id: 1, chat_initiator: 1, chat_recipient: 2 }] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const userId = 1;
        const chats = await getChats(userId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockDb.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith('id', userId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(chats).toEqual([{ id: 1, chat_initiator: 1, chat_recipient: 2 }]);
    });

    it('should get a single chat', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [{ id: 1, chat_initiator: 1, chat_recipient: 2 }] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const chatId = 1;
        const chat = await getChat(chatId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockDb.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith('id', chatId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(chat).toEqual({ id: 1, chat_initiator: 1, chat_recipient: 2 });
    });

    it('should get a chat between two users', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [{ id: 1, chat_initiator: 1, chat_recipient: 2 }] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const userId1 = 1;
        const userId2 = 2;
        const chat = await getChatBetweenUsers(userId1, userId2);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockDb.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith('userId1', userId1);
        expect(mockRequest.input).toHaveBeenCalledWith('userId2', userId2);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(chat).toEqual({ id: 1, chat_initiator: 1, chat_recipient: 2 });
    });

    it('should update the chat timestamp', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ rowsAffected: [1] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const chatId = 1;
        const result = await updateChatTimestamp(chatId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockDb.request).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith('chatId', chatId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should return null if no chats are found for a user', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const userId = 1;
        const chats = await getChats(userId);

        expect(chats).toBeNull();
    });

    it('should return null if no chat is found', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const chatId = 1;
        const chat = await getChat(chatId);

        expect(chat).toBeNull();
    });

    it('should return null if no chat is found between two users', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ recordset: [] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const userId1 = 1;
        const userId2 = 2;
        const chat = await getChatBetweenUsers(userId1, userId2);

        expect(chat).toBeNull();
    });

    it('should return false if chat timestamp is not updated', async () => {
        const mockRequest = {
            input: vi.fn(),
            query: vi.fn().mockResolvedValue({ rowsAffected: [0] }),
        };
        const mockDb = {
            request: vi.fn(() => mockRequest),
        };
        sql.connect.mockResolvedValue(mockDb);

        const chatId = 1;
        const result = await updateChatTimestamp(chatId);

        expect(result).toBe(false);
    });

    it('should throw an error if database connection fails', async () => {
        sql.connect.mockRejectedValue(new Error('DB connection error'));

        await expect(createChat(1, 2)).rejects.toThrow('DB connection error');
    });
});
