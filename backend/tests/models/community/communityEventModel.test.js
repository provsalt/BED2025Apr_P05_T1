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

  describe('getCommunityEventsByUserId', () => {
    it('returns success with user events', async () => {
      mockRequest.query.mockResolvedValue({ 
        recordset: [
          { id: 1, name: 'My Event 1', created_by_name: 'John Doe', image_url: '/api/s3?key=cover1' },
          { id: 2, name: 'My Event 2', created_by_name: 'John Doe', image_url: '/api/s3?key=cover2' }
        ] 
      });
      const result = await model.getCommunityEventsByUserId(1);
      expect(result).toEqual({ 
        success: true, 
        events: [
          { id: 1, name: 'My Event 1', created_by_name: 'John Doe', image_url: '/api/s3?key=cover1' },
          { id: 2, name: 'My Event 2', created_by_name: 'John Doe', image_url: '/api/s3?key=cover2' }
        ]
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns empty array for user with no events', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      const result = await model.getCommunityEventsByUserId(999);
      expect(result).toEqual({ success: true, events: [] });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.getCommunityEventsByUserId(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.getCommunityEventsByUserId(1);
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

  describe('updateCommunityEvent', () => {
    it('returns success on successful update', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
      const result = await model.updateCommunityEvent(1, {
        name: 'Updated Event',
        location: 'Updated Location',
        category: 'arts',
        date: '2025-07-21',
        time: '14:00:00',
        description: 'Updated description'
      }, 1);
      expect(result).toEqual({ success: true, message: expect.any(String) });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error when event not found or user has no permission', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [0] });
      const result = await model.updateCommunityEvent(999, {
        name: 'Updated Event'
      }, 1);
      expect(result).toEqual({ 
        success: false, 
        message: 'Event not found or you do not have permission to edit this event' 
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.updateCommunityEvent(1, { name: 'Test' }, 1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.updateCommunityEvent(1, { name: 'Test' }, 1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('Connect fail');
    });
  });

  describe('deleteUnwantedImages', () => {
    it('returns success when images are deleted', async () => {
      // Mock event ownership check
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1 }] 
      });
      // Mock images to delete query
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [
          { id: 1, image_url: '/api/s3?key=image1' },
          { id: 2, image_url: '/api/s3?key=image2' }
        ] 
      });
      // Mock delete queries (called twice for 2 images)
      mockRequest.query.mockResolvedValue({});
      
      const result = await model.deleteUnwantedImages(1, 1, [3, 4]); // Keep images 3,4, delete 1,2
      expect(result).toEqual({ 
        success: true, 
        message: '2 images deleted successfully',
        deletedUrls: ['/api/s3?key=image1', '/api/s3?key=image2']
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error when user does not own the event', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      const result = await model.deleteUnwantedImages(1, 999, [1, 2]);
      expect(result).toEqual({ 
        success: false, 
        message: 'Event not found or you do not have permission to delete images from this event' 
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns success when no images to delete', async () => {
      // Mock event ownership check
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1 }] 
      });
      // Mock images to delete query (empty)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      
      const result = await model.deleteUnwantedImages(1, 1, [1, 2]); // Keep all images
      expect(result).toEqual({ 
        success: true, 
        message: '0 images deleted successfully',
        deletedUrls: []
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.deleteUnwantedImages(1, 1, [1, 2]);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('DB fail');
    });

    it('returns error if connect fails', async () => {
      const mssql = await import('mssql');
      mssql.default.connect.mockRejectedValue(new Error('Connect fail'));
      model = await import('../../../models/community/communityEventModel.js');
      const result = await model.deleteUnwantedImages(1, 1, [1, 2]);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
      expect(result.error).toBe('Connect fail');
    });
  });

  describe('signUpForCommunityEvent', () => {
    it('returns success when user signs up for event', async () => {
      // Mock the check for existing signup (no existing signup)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      // Mock the event check (event exists and is approved)
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1, name: 'Test Event', approved_by_admin_id: 1 }] 
      });
      // Mock the insert query
      mockRequest.query.mockResolvedValueOnce({});
       
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result).toEqual({ 
        success: true, 
        message: 'Successfully signed up for event',
        eventName: 'Test Event'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if user already signed up', async () => {
      // Mock the check for existing signup (user already signed up)
      mockRequest.query.mockResolvedValueOnce({ 
         recordset: [{ user_id: 1, community_event_id: 1 }] 
       });
       
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result).toEqual({ 
        success: false, 
        message: 'User is already signed up for this event'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if event not found', async () => {
      // Mock the check for existing signup (no existing signup)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      // Mock the event check (event not found)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
       
      const result = await model.signUpForCommunityEvent(1, 999);
      expect(result).toEqual({ 
        success: false, 
        message: 'Event not found'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if event not approved', async () => {
      // Mock the check for existing signup (no existing signup)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      // Mock the event check (event exists but not approved)
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1, name: 'Test Event', approved_by_admin_id: null }] 
      });
       
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result).toEqual({ 
        success: false, 
        message: 'Event is not approved'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if user tries to sign up for their own event', async () => {
      // Mock the check for existing signup (no existing signup)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      // Mock the event check (event exists approved, but user created the event)
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ id: 1, name: 'Test Event', approved_by_admin_id: 1, user_id: 1 }] 
      });
       
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result).toEqual({ 
        success: false, 
        message: 'You cannot sign up for your own event'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if event is in the past', async () => {
      // Mock the check for existing signup (no existing signup)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      // Mock the event check (event exists and is approved, but date/time is in the past)
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ 
          id: 1, 
          name: 'Past Event', 
          approved_by_admin_id: 1, 
          user_id: 2,
          date: new Date('2025-01-01'), // Past date
          time: new Date('1970-01-01T10:00:00.000Z') // Past time
        }] 
      });
       
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result).toEqual({ 
        success: false, 
        message: 'Event is in the past'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if event is happening now (current time)', async () => {
      // Mock the check for existing signup (no existing signup)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
      // Mock the event check (event exists and is approved, but date/time is current)
      const now = new Date();
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ 
          id: 1, 
          name: 'Current Event', 
          approved_by_admin_id: 1, 
          user_id: 2,
          date: now,
          time: now
        }] 
      });
       
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result).toEqual({ 
        success: false, 
        message: 'Event is in the past'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.signUpForCommunityEvent(1, 1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error occurred');
    });
  });

  describe('getUserSignedUpEvents', () => {
    it('returns success with user signed up events', async () => {
      mockRequest.query.mockResolvedValue({ 
        recordset: [
          { 
            id: 1, 
            name: 'Event 1', 
            location: 'Location 1',
            category: 'sports',
            date: '2025-07-20',
            time: '12:00:00',
            description: 'Description 1',
            signed_up_at: '2025-01-01T00:00:00Z',
            created_by_name: 'John Doe'
          },
          { 
            id: 2, 
            name: 'Event 2', 
            location: 'Location 2',
            category: 'arts',
            date: '2025-07-21',
            time: '14:00:00',
            description: 'Description 2',
            signed_up_at: '2025-01-01T00:00:01Z',
            created_by_name: 'Jane Smith'
          }
        ] 
      });
      
      const result = await model.getUserSignedUpEvents(1);
      expect(result).toEqual({ 
        success: true, 
        events: [
          { 
            id: 1, 
            name: 'Event 1', 
            location: 'Location 1',
            category: 'sports',
            date: '2025-07-20',
            time: '12:00:00',
            description: 'Description 1',
            signed_up_at: '2025-01-01T00:00:00Z',
            created_by_name: 'John Doe'
          },
          { 
            id: 2, 
            name: 'Event 2', 
            location: 'Location 2',
            category: 'arts',
            date: '2025-07-21',
            time: '14:00:00',
            description: 'Description 2',
            signed_up_at: '2025-01-01T00:00:01Z',
            created_by_name: 'Jane Smith'
          }
        ]
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns empty array for user with no signed up events', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });
      const result = await model.getUserSignedUpEvents(999);
      expect(result).toEqual({ success: true, events: [] });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.getUserSignedUpEvents(1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error occurred');
    });
  });

  describe('cancelCommunityEventSignup', () => {
    it('returns success when user cancels signup', async () => {
      // Mock the check for existing signup (user is signed up)
      mockRequest.query.mockResolvedValueOnce({ 
        recordset: [{ user_id: 1, community_event_id: 1 }] 
      });
      // Mock the delete query
      mockRequest.query.mockResolvedValueOnce({});
       
      const result = await model.cancelCommunityEventSignup(1, 1);
      expect(result).toEqual({ 
        success: true, 
        message: 'Successfully cancelled event signup'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error if user not signed up', async () => {
      // Mock the check for existing signup (user not signed up)
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });
       
      const result = await model.cancelCommunityEventSignup(1, 999);
      expect(result).toEqual({ 
        success: false, 
        message: 'User is not signed up for this event'
      });
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('returns error on db error', async () => {
      mockRequest.query.mockRejectedValue(new Error('DB fail'));
      const result = await model.cancelCommunityEventSignup(1, 1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error occurred');
    });
  });
  
}); 