import { describe, it, expect, vi, beforeEach } from 'vitest';
import { approveUserDeletionController, getDeletionRequestsController } from '../../../controllers/admin/adminController.js';
import * as userModel from '../../../models/user/userModel.js';

vi.mock('../../../models/user/userModel.js', () => ({
  getUsersWithDeletionRequested: vi.fn(),
  approveUserDeletionRequest: vi.fn(),
}));

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: '1' } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    vi.clearAllMocks();
  });

  describe('getDeletionRequestsController', () => {
    it('should return 200 and list of users with deletion requests', async () => {
      const mockUsers = [{ id: 1, name: 'User1' }];
      userModel.getUsersWithDeletionRequested.mockResolvedValue(mockUsers);
      await getDeletionRequestsController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 on server error', async () => {
      userModel.getUsersWithDeletionRequested.mockRejectedValue(new Error('fail'));
      await getDeletionRequestsController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('approveUserDeletionController', () => {
    it('should return 200 if user deletion is successful', async () => {
      userModel.approveUserDeletionRequest.mockResolvedValue(true);
      await approveUserDeletionController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 400 if deletion fails', async () => {
      userModel.approveUserDeletionRequest.mockResolvedValue(false);
      await approveUserDeletionController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete user' });
    });

    it('should return 400 for invalid user ID', async () => {
      req.params.id = 'not-a-number';
      await approveUserDeletionController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('should return 500 on server error', async () => {
      userModel.approveUserDeletionRequest.mockRejectedValue(new Error('fail'));
      await approveUserDeletionController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
}); 