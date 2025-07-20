import {beforeEach, describe, expect, it, vi} from "vitest";
import {getUserLoginHistoryController} from "../../../controllers/user/loginHistoryController.js";
import {getLoginHistoryByUserId} from "../../../models/user/userModel.js";

vi.mock("../../../models/user/userModel.js", () => ({
  getLoginHistoryByUserId: vi.fn(),
}))

describe('getUserLoginHistoryController', () => {
  let req, res;
  beforeEach(async () => {
    req = { user: { id: 1 }, query: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  });

  it('should return 200 and login history on success', async () => {
    const mockHistory = [{ id: 1, login_time: '2023-01-01T10:00:00' }];
    getLoginHistoryByUserId.mockResolvedValue(mockHistory);
    await getUserLoginHistoryController(req, res);
    expect(getLoginHistoryByUserId).toHaveBeenCalledWith(1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockHistory);
  });

  it('should return 401 if user is not authenticated', async () => {
    req.user = null;
    req.query = {};
    await getUserLoginHistoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('should return 500 on server error', async () => {
    getLoginHistoryByUserId.mockRejectedValue(new Error('DB error'));
    await getUserLoginHistoryController(req, res);
    expect(getLoginHistoryByUserId).toHaveBeenCalledWith(1, 10);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve login history' });
  });
});
