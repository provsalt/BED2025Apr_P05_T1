import {beforeEach, describe, expect, it, vi} from "vitest";
import {getUserLoginHistoryController} from "../../../controllers/user/loginHistoryController.js";

// Mock dependencies
vi.mock("../../../models/user/userModel.js", () => ({
  getLoginHistoryByUserId: vi.fn(),
}));

vi.mock("../../../utils/AppError.js", () => ({
  ErrorFactory: {
    unauthorized: vi.fn((message) => new Error(message)),
    validation: vi.fn((message) => new Error(message)),
  }
}));

import {getLoginHistoryByUserId} from "../../../models/user/userModel.js";
import { ErrorFactory } from "../../../utils/AppError.js";

describe('getUserLoginHistoryController', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = { user: { id: 1 }, query: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 200 and login history on success', async () => {
    const mockHistory = [{ id: 1, login_time: '2023-01-01T10:00:00' }];
    getLoginHistoryByUserId.mockResolvedValue(mockHistory);
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(getLoginHistoryByUserId).toHaveBeenCalledWith(1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockHistory);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with unauthorized AppError if user is not authenticated', async () => {
    req.user = null;
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(ErrorFactory.unauthorized).toHaveBeenCalledWith("Unauthorized");
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should call next with error if there is a server error', async () => {
    const serverError = new Error('DB error');
    getLoginHistoryByUserId.mockRejectedValue(serverError);
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(getLoginHistoryByUserId).toHaveBeenCalledWith(1, 10);
    expect(next).toHaveBeenCalledWith(serverError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should use custom limit from query parameter', async () => {
    req.query.limit = '5';
    const mockHistory = [{ id: 1, login_time: '2023-01-01T10:00:00' }];
    getLoginHistoryByUserId.mockResolvedValue(mockHistory);
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(getLoginHistoryByUserId).toHaveBeenCalledWith(1, 5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockHistory);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with validation AppError for invalid limit parameter', async () => {
    req.query.limit = 'invalid';
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(ErrorFactory.validation).toHaveBeenCalledWith("Limit must be a number between 1 and 100");
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should call next with validation AppError for limit below 1', async () => {
    req.query.limit = '0';
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(ErrorFactory.validation).toHaveBeenCalledWith("Limit must be a number between 1 and 100");
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should call next with validation AppError for limit above 100', async () => {
    req.query.limit = '101';
    
    await getUserLoginHistoryController(req, res, next);
    
    expect(ErrorFactory.validation).toHaveBeenCalledWith("Limit must be a number between 1 and 100");
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
