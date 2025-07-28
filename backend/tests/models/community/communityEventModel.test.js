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

  describe('createCommunityEvent', () => {
    it('returns success on insert', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [{ id: 42 }] });
      const result = await model.createCommunityEvent({
        name: 'Event', location: 'Loc', category: 'sports', date: '2025-07-20', time: '12:00:00', description: 'desc', user_id: 1, approved_by_admin_id: 1
      });
      expect(result).toEqual({ success: true, message: expect.any(String), eventId: 42 });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.createCommunityEvent({});
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.createCommunityEvent({});
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('Connect fail');
    });
  });

  describe('addCommunityEventImage', () => {
    it('returns success on insert', async () => {
      mockRequest.query.mockResolvedValue({});
      const result = await model.addCommunityEventImage(1, '/api/s3?key=test-image');
      expect(result).toEqual({ success: true, message: expect.any(String) });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.addCommunityEventImage(1, '/api/s3?key=test-image');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('handles S3 URLs correctly', async () => {
      mockRequest.query.mockResolvedValue({});
      const s3Url = '/api/s3?key=community-events/1/uuid-test-image.jpg';
      const result = await model.addCommunityEventImage(1, s3Url);
      expect(result).toEqual({ success: true, message: expect.any(String) });
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });

  describe('getAllApprovedEvents', () => {
    it('returns success with events and cover images', async () => {
      mockRequest.query.mockResolvedValue({ 
        recordset: [
          { id: 1, name: 'Event 1', image_url: '/api/s3?key=cover1' },
          { id: 2, name: 'Event 2', image_url: '/api/s3?key=cover2' }
        ] 
      });
      const result = await model.getAllApprovedEvents();
      expect(result).toEqual({ 
        success: true, 
        events: [
          { id: 1, name: 'Event 1', image_url: '/api/s3?key=cover1' },
          { id: 2, name: 'Event 2', image_url: '/api/s3?key=cover2' }
        ] 
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.getAllApprovedEvents();
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.getAllApprovedEvents();
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('Connect fail');
    });
  });

  describe('getCommunityEventImages', () => {
    it('returns success with images', async () => {
      mockRequest.query.mockResolvedValue({ 
        recordset: [
          { id: 1, image_url: '/api/s3?key=test1', uploaded_at: '2025-01-01T00:00:00Z' },
          { id: 2, image_url: '/api/s3?key=test2', uploaded_at: '2025-01-01T00:00:01Z' }
        ] 
      });
      const result = await model.getCommunityEventImages(1);
      expect(result).toEqual({ 
        success: true, 
        images: [
          { id: 1, image_url: '/api/s3?key=test1', uploaded_at: '2025-01-01T00:00:00Z' },
          { id: 2, image_url: '/api/s3?key=test2', uploaded_at: '2025-01-01T00:00:01Z' }
        ] 
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns empty array if no images', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      const result = await model.getCommunityEventImages(1);
      expect(result).toEqual({ success: true, images: [] });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.getCommunityEventImages(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.getCommunityEventImages(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('Connect fail');
    });
  });

  describe('getCommunityEventById', () => {
    it('returns success with event and images', async () => {
      // Mock the main event query
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1, name: 'Event 1', created_by_name: 'John Doe' }] 
      });
      // Mock the images query
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [
          { id: 1, image_url: '/api/s3?key=test1', uploaded_at: '2025-01-01T00:00:00Z' },
          { id: 2, image_url: '/api/s3?key=test2', uploaded_at: '2025-01-01T00:00:01Z' }
        ] 
      });
      
      const result = await model.getCommunityEventById(1);
      expect(result).toEqual({ 
        success: true, 
        event: { 
          id: 1, 
          name: 'Event 1', 
          created_by_name: 'John Doe',
          images: [
            { id: 1, image_url: '/api/s3?key=test1', uploaded_at: '2025-01-01T00:00:00Z' },
            { id: 2, image_url: '/api/s3?key=test2', uploaded_at: '2025-01-01T00:00:01Z' }
          ]
        } 
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns success with event and empty images array', async () => {
      // Mock the main event query
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1, name: 'Event 1', created_by_name: 'John Doe' }] 
      });
      // Mock the images query returning empty
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      
      const result = await model.getCommunityEventById(1);
      expect(result).toEqual({ 
        success: true, 
        event: { 
          id: 1, 
          name: 'Event 1', 
          created_by_name: 'John Doe',
          images: []
        } 
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns not found if no event', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      const result = await model.getCommunityEventById(999);
      expect(result).toEqual({ success: false, message: 'Event not found' });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.getCommunityEventById(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.getCommunityEventById(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('Connect fail');
    });
  });

  
}); 