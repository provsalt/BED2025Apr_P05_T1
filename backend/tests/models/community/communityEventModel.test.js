import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('communityEventModel', () => {
  let mockConnection, mockRequest, model;
  beforeEach(async () => {
    vi.resetModules();
    vi.doMock('mssql', () => ({
      default: {
        connect: vi.fn(),
        ConnectionPool: vi.fn(),
        NVarChar: vi.fn(),
        Int: vi.fn(),
        Date: vi.fn(),
        VarChar: vi.fn(),
        MAX: 9999,
      }
    }));
    vi.doMock('../../../backend/config/db.js', () => ({ dbConfig: {} }));

    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn(),
    };
    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn(),
    };
    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
    model = await import('../../../models/community/communityEventModel.js');
  });

  it('createCommunityEvent returns success on insert', async () => {
    mockRequest.query.mockResolvedValue({ recordset: [{ id: 42 }] });
    const result = await model.createCommunityEvent({
      name: 'Event', location: 'Loc', category: 'sports', date: '2025-07-20', time: '12:00:00', description: 'desc', user_id: 1, approved_by_admin_id: 1
    });
    expect(result).toEqual({ success: true, message: expect.any(String), eventId: 42 });
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('createCommunityEvent returns error on db error', async () => {
    mockRequest.query.mockRejectedValue(new Error('DB fail'));
    const result = await model.createCommunityEvent({});
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
    expect(result.error).toBe('DB fail');
  });

  it('createCommunityEvent returns error if connect fails', async () => {
    const mssql = await import('mssql');
    mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
    model = await import('../../../models/community/communityEventModel.js');
    const result = await model.createCommunityEvent({});
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
    expect(result.error).toBe('Connect fail');
  });

  it('addCommunityEventImage returns success on insert', async () => {
    mockRequest.query.mockResolvedValue({});
    const result = await model.addCommunityEventImage(1, 'imgurl');
    expect(result).toEqual({ success: true, message: expect.any(String) });
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('addCommunityEventImage returns error on db error', async () => {
    mockRequest.query.mockRejectedValue(new Error('DB fail'));
    const result = await model.addCommunityEventImage(1, 'imgurl');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
    expect(result.error).toBe('DB fail');
  });
}); 