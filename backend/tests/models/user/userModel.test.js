import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  updateUserProfilePicture,
  getLoginHistoryByUserId,
  insertLoginHistory,
  changeUserRole,
  getAllUsers
} from "../../../models/user/userModel.js";

// Mock dependencies
vi.mock("mssql", () => ({
  default: {
    connect: vi.fn(),
    Int: "Int",
    Transaction: vi.fn()
  }
}));

vi.mock("../../../config/db.js", () => ({
  dbConfig: { server: "localhost", database: "test" }
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn()
  }
}));

import sql from "mssql";
import bcrypt from "bcryptjs";

describe("User Model", () => {
  let mockDb, mockRequest, mockTransaction;

  beforeEach(() => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn()
    };
    
    mockTransaction = {
      begin: vi.fn().mockResolvedValue(),
      commit: vi.fn().mockResolvedValue(),
      rollback: vi.fn().mockResolvedValue(),
      request: vi.fn(() => mockRequest)
    };
    
    mockDb = {
      request: vi.fn(() => mockRequest)
    };
    
    sql.connect.mockResolvedValue(mockDb);
    sql.Transaction = vi.fn(() => mockTransaction);
    vi.clearAllMocks();
  });

  describe("getUser", () => {
    it("should return user when found", async () => {
      const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
      mockRequest.query.mockResolvedValue({
        recordset: [mockUser]
      });

      const result = await getUser(1);

      expect(sql.connect).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("id", 1);
      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Users WHERE id = @id");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockRequest.query.mockResolvedValue({
        recordset: []
      });

      const result = await getUser(999);

      expect(result).toBeNull();
    });

    it("should handle database connection errors", async () => {
      sql.connect.mockRejectedValue(new Error("Connection failed"));

      await expect(getUser(1)).rejects.toThrow("Connection failed");
    });

    it("should handle query errors", async () => {
      mockRequest.query.mockRejectedValue(new Error("Query failed"));

      await expect(getUser(1)).rejects.toThrow("Query failed");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found by email", async () => {
      const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
      mockRequest.query.mockResolvedValue({
        recordset: [mockUser]
      });

      const result = await getUserByEmail("john@example.com");

      expect(mockRequest.input).toHaveBeenCalledWith("email", "john@example.com");
      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Users WHERE email = @email");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found by email", async () => {
      mockRequest.query.mockResolvedValue({
        recordset: []
      });

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockRejectedValue(new Error("Database error"));

      await expect(getUserByEmail("john@example.com")).rejects.toThrow("Database error");
    });
  });

  describe("createUser", () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      date_of_birth: 631152000,
      gender: "Male"
    };

    it("should create user successfully", async () => {
      const mockResult = { id: 1 };
      bcrypt.hash.mockResolvedValue("hashedpassword");
      mockRequest.query.mockResolvedValue({
        recordset: [mockResult]
      });

      const result = await createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(mockRequest.input).toHaveBeenCalledWith("name", "John Doe");
      expect(mockRequest.input).toHaveBeenCalledWith("email", "john@example.com");
      expect(mockRequest.input).toHaveBeenCalledWith("hashedPassword", "hashedpassword");
      expect(mockRequest.input).toHaveBeenCalledWith("dob", new Date(631152000 * 1000));
      expect(mockRequest.input).toHaveBeenCalledWith("gender", "Male");
      expect(result).toEqual(mockResult);
    });

    it("should handle password hashing errors", async () => {
      bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));

      await expect(createUser(userData)).rejects.toThrow("Hashing failed");
    });

    it("should handle database insertion errors", async () => {
      bcrypt.hash.mockResolvedValue("hashedpassword");
      mockRequest.query.mockRejectedValue(new Error("Insert failed"));

      await expect(createUser(userData)).rejects.toThrow("Insert failed");
    });

    it("should convert date_of_birth from seconds to milliseconds", async () => {
      bcrypt.hash.mockResolvedValue("hashedpassword");
      mockRequest.query.mockResolvedValue({ recordset: [{ id: 1 }] });

      await createUser(userData);

      expect(mockRequest.input).toHaveBeenCalledWith("dob", new Date(631152000 * 1000));
    });
  });

  describe("updateUser", () => {
    const updateData = {
      name: "Updated Name",
      email: "updated@example.com"
    };

    it("should update user successfully", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            password: "hashedpassword",
            date_of_birth: "1990-01-01",
            gender: "Male",
            language: "English"
          }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [1]
        });

      const result = await updateUser(1, updateData);

      expect(result).toBe(true);
      expect(mockRequest.input).toHaveBeenCalledWith("id", 1);
      expect(mockRequest.input).toHaveBeenCalledWith("name", "Updated Name");
      expect(mockRequest.input).toHaveBeenCalledWith("email", "updated@example.com");
    });

    it("should throw error if user not found", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: []
      });

      await expect(updateUser(999, updateData)).rejects.toThrow("User not found");
    });

    it("should use current values for missing fields", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            password: "hashedpassword",
            date_of_birth: "1990-01-01",
            gender: "Male",
            language: "English"
          }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [1]
        });

      await updateUser(1, { name: "New Name" });

      expect(mockRequest.input).toHaveBeenCalledWith("name", "New Name");
      expect(mockRequest.input).toHaveBeenCalledWith("email", "john@example.com");
      expect(mockRequest.input).toHaveBeenCalledWith("password", "hashedpassword");
      expect(mockRequest.input).toHaveBeenCalledWith("dob", "1990-01-01");
      expect(mockRequest.input).toHaveBeenCalledWith("gender", "Male");
    });

    it("should return false when no rows affected", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            password: "hashedpassword"
          }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [0]
        });

      const result = await updateUser(1, updateData);

      expect(result).toBe(false);
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          password: "hashedpassword"
        }]
      });
      mockRequest.query.mockRejectedValueOnce(new Error("Update failed"));

      await expect(updateUser(1, updateData)).rejects.toThrow("Update failed");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      // Mock user existence check - user exists
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ id: 1 }] // User found
      });
      
      // Mock transaction operations (cleanup queries + final delete)
      mockRequest.query.mockResolvedValue({
        rowsAffected: [1]
      });

      const result = await deleteUser(1);

      expect(result).toBe(true);
    });

    it("should return false when no rows affected", async () => {
      // Mock user existence check - user doesn't exist
      mockRequest.query.mockResolvedValueOnce({
        recordset: [] // No user found
      });

      const result = await deleteUser(999);

      expect(result).toBe(false);
    });

    it("should handle database errors", async () => {
      // Mock user existence check first
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ id: 1 }] // User found
      });
      
      // Then mock the transaction to fail
      mockRequest.query.mockRejectedValueOnce(new Error("Delete failed"));

      await expect(deleteUser(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("updateUserProfilePicture", () => {
    it("should update profile picture successfully", async () => {
      mockRequest.query.mockResolvedValue({
        rowsAffected: [1]
      });

      const result = await updateUserProfilePicture(1, "http://example.com/pic.jpg");

      expect(mockRequest.input).toHaveBeenCalledWith("url", "http://example.com/pic.jpg");
      expect(mockRequest.input).toHaveBeenCalledWith("id", 1);
      expect(result).toBe(true);
    });

    it("should return false when no rows affected", async () => {
      mockRequest.query.mockResolvedValue({
        rowsAffected: [0]
      });

      const result = await updateUserProfilePicture(999, "http://example.com/pic.jpg");

      expect(result).toBe(false);
    });

    it("should handle null URL", async () => {
      mockRequest.query.mockResolvedValue({
        rowsAffected: [1]
      });

      const result = await updateUserProfilePicture(1, null);

      expect(mockRequest.input).toHaveBeenCalledWith("url", null);
      expect(result).toBe(true);
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockRejectedValue(new Error("Update failed"));

      await expect(updateUserProfilePicture(1, "url")).rejects.toThrow("Update failed");
    });
  });

  describe("getLoginHistoryByUserId", () => {
    it("should return login history with default limit", async () => {
      const mockHistory = [
        { id: 1, login_time: "2023-01-01T10:00:00" },
        { id: 2, login_time: "2023-01-02T10:00:00" }
      ];
      mockRequest.query.mockResolvedValue({
        recordset: mockHistory
      });

      const result = await getLoginHistoryByUserId(1);

      expect(mockRequest.input).toHaveBeenCalledWith("userId", sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith("limit", sql.Int, 10);
      expect(mockRequest.query).toHaveBeenCalledWith(
        "SELECT TOP (@limit) id, CONVERT(VARCHAR(30), login_time, 126) as login_time FROM UserLoginHistory WHERE user_id = @userId ORDER BY login_time DESC"
      );
      expect(result).toEqual(mockHistory);
    });

    it("should return login history with custom limit", async () => {
      const mockHistory = [{ id: 1, login_time: "2023-01-01T10:00:00" }];
      mockRequest.query.mockResolvedValue({
        recordset: mockHistory
      });

      const result = await getLoginHistoryByUserId(1, 5);

      expect(mockRequest.input).toHaveBeenCalledWith("limit", sql.Int, 5);
      expect(result).toEqual(mockHistory);
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockRejectedValue(new Error("Query failed"));

      await expect(getLoginHistoryByUserId(1)).rejects.toThrow("Query failed");
    });

    it("should return empty array when no history found", async () => {
      mockRequest.query.mockResolvedValue({
        recordset: []
      });

      const result = await getLoginHistoryByUserId(999);

      expect(result).toEqual([]);
    });
  });

  describe("insertLoginHistory", () => {
    it("should insert login history successfully", async () => {
      mockRequest.query.mockResolvedValue({});

      await insertLoginHistory(1);

      expect(mockRequest.input).toHaveBeenCalledWith("userId", sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith(
        "INSERT INTO UserLoginHistory (user_id) VALUES (@userId)"
      );
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockRejectedValue(new Error("Insert failed"));

      await expect(insertLoginHistory(1)).rejects.toThrow("Insert failed");
    });
  });

  describe("changeUserRole", () => {
    it("should change user role to Admin successfully", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ id: 1, name: "John Doe", role: "User" }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [1]
        });

      const result = await changeUserRole(1, "admin");

      expect(mockRequest.input).toHaveBeenCalledWith("id", 1);
      expect(mockRequest.input).toHaveBeenCalledWith("role", "Admin");
      expect(result).toBe(true);
    });

    it("should change user role to User successfully", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ id: 1, name: "John Doe", role: "Admin" }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [1]
        });

      const result = await changeUserRole(1, "user");

      expect(mockRequest.input).toHaveBeenCalledWith("role", "User");
      expect(result).toBe(true);
    });

    it("should return false if user not found", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: []
      });

      const result = await changeUserRole(999, "admin");

      expect(result).toBe(false);
    });

    it("should return false for invalid role", async () => {
      // Mock getUser call but the function should return early due to invalid role
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ id: 1, name: "John Doe", role: "User" }]
      });

      const result = await changeUserRole(1, "invalidrole");

      expect(result).toBe(false);
      // Verify that only getUser was called, not the update query
      expect(mockRequest.query).toHaveBeenCalledTimes(1);
    });

    it("should capitalize role correctly", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ id: 1, name: "John Doe", role: "User" }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [1]
        });

      await changeUserRole(1, "admin");

      expect(mockRequest.input).toHaveBeenCalledWith("role", "Admin");
    });

    it("should return false when no rows affected", async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ id: 1, name: "John Doe" }]
        })
        .mockResolvedValueOnce({
          rowsAffected: [0]
        });

      const result = await changeUserRole(1, "admin");

      expect(result).toBe(false);
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ id: 1, name: "John Doe" }]
      });
      mockRequest.query.mockRejectedValueOnce(new Error("Database error"));

      await expect(changeUserRole(1, "admin")).rejects.toThrow("Database error");
    });
  });

  describe("getAllUsers", () => {
    it("should return all users successfully", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Doe", email: "jane@example.com" }
      ];
      mockRequest.query.mockResolvedValue({
        recordset: mockUsers
      });

      const result = await getAllUsers();

      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Users");
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array when no users found", async () => {
      mockRequest.query.mockResolvedValue({
        recordset: []
      });

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockRequest.query.mockRejectedValue(new Error("Query failed"));

      await expect(getAllUsers()).rejects.toThrow("Query failed");
    });
  });
});