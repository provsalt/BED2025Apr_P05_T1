import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approveUserDeletionController, getDeletionRequestsController } from '../../../controllers/admin/adminController.js';
import * as userModel from '../../../models/user/userModel.js';

vi.mock('../../../models/user/userModel.js', () => ({
  getUsersWithDeletionRequested: vi.fn(),
  approveUserDeletionRequest: vi.fn(),
}));

vi.mock('../../../utils/AppError.js', () => ({
  ErrorFactory: {
    validation: vi.fn((message) => new Error(message)),
    notFound: vi.fn((resource) => new Error(`${resource} not found`)),
  }
}));

describe('Admin Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { userId: 1 } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getDeletionRequestsController', () => {
    it('should return 200 and list of users with deletion requests', async () => {
      const mockUsers = [{ id: 1, name: 'User1' }];
      userModel.getUsersWithDeletionRequested.mockResolvedValue(mockUsers);
      await getDeletionRequestsController(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on server error', async () => {
      const serverError = new Error('fail');
      userModel.getUsersWithDeletionRequested.mockRejectedValue(serverError);
      await getDeletionRequestsController(req, res, next);
      expect(next).toHaveBeenCalledWith(serverError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('approveUserDeletionController', () => {
    it('should return 200 if user deletion is successful', async () => {
      userModel.approveUserDeletionRequest.mockResolvedValue(true);
      await approveUserDeletionController(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with notFound error if deletion fails', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      userModel.approveUserDeletionRequest.mockResolvedValue(false);
      await approveUserDeletionController(req, res, next);
      expect(ErrorFactory.notFound).toHaveBeenCalledWith('User deletion request');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with validation error for invalid user ID', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.body.userId = 'not-a-number';
      await approveUserDeletionController(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Invalid user ID');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with validation error for missing user ID', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.body.userId = null;
      await approveUserDeletionController(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Invalid user ID');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error on server error', async () => {
      const serverError = new Error('fail');
      userModel.approveUserDeletionRequest.mockRejectedValue(serverError);
      await approveUserDeletionController(req, res, next);
      expect(next).toHaveBeenCalledWith(serverError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
}); 