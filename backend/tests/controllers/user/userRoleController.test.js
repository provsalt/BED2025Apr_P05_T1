import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updateUserRoleController,
  getUsersByRoleController,
  bulkUpdateUserRolesController,
} from "../../../controllers/user/userRoleController.js";

// Mock dependencies
vi.mock("../../../models/admin/adminModel.js", () => ({
  updateUserRole: vi.fn(),
  getUsersByRole: vi.fn(),
  bulkUpdateUserRoles: vi.fn(),
}));

vi.mock("../../../utils/AppError.js", () => ({
  ErrorFactory: {
    validation: vi.fn((message) => new Error(message)),
    notFound: vi.fn((resource) => new Error(`${resource} not found`)),
  }
}));

import { updateUserRole, getUsersByRole, bulkUpdateUserRoles } from "../../../models/admin/adminModel.js";
import { ErrorFactory } from "../../../utils/AppError.js";

describe("User Role Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: {},
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("updateUserRoleController", () => {
    beforeEach(() => {
      req.params.id = "2";
      req.body.role = "User";
    });

    it("should update user role successfully", async () => {
      updateUserRole.mockResolvedValue();

      await updateUserRoleController(req, res, next);

      expect(updateUserRole).toHaveBeenCalledWith(2, "User");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User role updated to User successfully",
        userId: 2,
        newRole: "User"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for invalid user ID", async () => {
      req.params.id = "invalid";

      await updateUserRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid user ID");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for missing user ID", async () => {
      req.params.id = undefined;

      await updateUserRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid user ID");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for invalid role", async () => {
      req.body.role = "InvalidRole";

      await updateUserRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid role. Must be 'User' or 'Admin'");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for missing role", async () => {
      req.body.role = undefined;

      await updateUserRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid role. Must be 'User' or 'Admin'");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError when admin tries to demote themselves", async () => {
      req.params.id = "1"; // Same as req.user.id
      req.body.role = "User";

      await updateUserRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Cannot change your own admin role");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should allow admin to keep their own admin role", async () => {
      req.params.id = "1"; // Same as req.user.id
      req.body.role = "Admin";
      updateUserRole.mockResolvedValue();

      await updateUserRoleController(req, res, next);

      expect(updateUserRole).toHaveBeenCalledWith(1, "Admin");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with notFound AppError if user not found", async () => {
      updateUserRole.mockRejectedValue(new Error("User not found"));

      await updateUserRoleController(req, res, next);

      expect(ErrorFactory.notFound).toHaveBeenCalledWith("User");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with error if there is a server error", async () => {
      const serverError = new Error("Database error");
      updateUserRole.mockRejectedValue(serverError);

      await updateUserRoleController(req, res, next);

      expect(next).toHaveBeenCalledWith(serverError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getUsersByRoleController", () => {
    it("should get users by role successfully", async () => {
      req.params.role = "admin";
      const mockUsers = [
        { id: 1, name: "Admin User", role: "Admin" },
        { id: 2, name: "Another Admin", role: "Admin" }
      ];
      getUsersByRole.mockResolvedValue(mockUsers);

      await getUsersByRoleController(req, res, next);

      expect(getUsersByRole).toHaveBeenCalledWith("Admin");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle lowercase role parameter", async () => {
      req.params.role = "user";
      const mockUsers = [{ id: 3, name: "Regular User", role: "User" }];
      getUsersByRole.mockResolvedValue(mockUsers);

      await getUsersByRoleController(req, res, next);

      expect(getUsersByRole).toHaveBeenCalledWith("User");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for invalid role", async () => {
      req.params.role = "invalid";

      await getUsersByRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid role. Must be 'user' or 'admin'");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for missing role", async () => {
      req.params.role = undefined;

      await getUsersByRoleController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid role. Must be 'user' or 'admin'");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with error if there is a server error", async () => {
      req.params.role = "admin";
      const serverError = new Error("Database error");
      getUsersByRole.mockRejectedValue(serverError);

      await getUsersByRoleController(req, res, next);

      expect(next).toHaveBeenCalledWith(serverError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("bulkUpdateUserRolesController", () => {
    const validUpdates = [
      { userId: 2, role: "Admin" },
      { userId: 3, role: "User" }
    ];

    beforeEach(() => {
      req.body.userRoleUpdates = validUpdates;
    });

    it("should bulk update user roles successfully", async () => {
      bulkUpdateUserRoles.mockResolvedValue(2);

      await bulkUpdateUserRolesController(req, res, next);

      expect(bulkUpdateUserRoles).toHaveBeenCalledWith(validUpdates);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "2 user roles updated successfully",
        updatedCount: 2,
        updates: validUpdates
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for non-array input", async () => {
      req.body.userRoleUpdates = "not an array";

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid user role updates array");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for empty array", async () => {
      req.body.userRoleUpdates = [];

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid user role updates array");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for missing userRoleUpdates", async () => {
      req.body.userRoleUpdates = undefined;

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid user role updates array");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for invalid update format - missing userId", async () => {
      req.body.userRoleUpdates = [{ role: "Admin" }];

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid update format. Each update must have userId and valid role");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for invalid update format - missing role", async () => {
      req.body.userRoleUpdates = [{ userId: 2 }];

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid update format. Each update must have userId and valid role");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError for invalid role", async () => {
      req.body.userRoleUpdates = [{ userId: 2, role: "InvalidRole" }];

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Invalid update format. Each update must have userId and valid role");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should call next with validation AppError when admin tries to demote themselves", async () => {
      req.body.userRoleUpdates = [{ userId: 1, role: "User" }]; // userId 1 is req.user.id

      await bulkUpdateUserRolesController(req, res, next);

      expect(ErrorFactory.validation).toHaveBeenCalledWith("Cannot change your own admin role");
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should allow admin to keep their own admin role in bulk update", async () => {
      req.body.userRoleUpdates = [
        { userId: 1, role: "Admin" }, // Keep admin role
        { userId: 2, role: "User" }
      ];
      bulkUpdateUserRoles.mockResolvedValue(2);

      await bulkUpdateUserRolesController(req, res, next);

      expect(bulkUpdateUserRoles).toHaveBeenCalledWith(req.body.userRoleUpdates);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if there is a server error", async () => {
      const serverError = new Error("Database error");
      bulkUpdateUserRoles.mockRejectedValue(serverError);

      await bulkUpdateUserRolesController(req, res, next);

      expect(next).toHaveBeenCalledWith(serverError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});