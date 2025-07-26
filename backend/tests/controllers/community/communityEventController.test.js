import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createEvent, getApprovedEvents, deleteEvent, getMyEvents, getEventById } from '../../../controllers/community/communityEventController.js';

// Ensure S3_BUCKET_NAME is set for all tests
beforeAll(() => {
  process.env.S3_BUCKET_NAME = 'test-bucket';
});

// Mock S3 service
vi.mock('../../../services/s3Service.js', () => ({
  uploadFile: vi.fn().mockResolvedValue(),
  deleteFile: vi.fn().mockResolvedValue(),
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123'),
}));

vi.mock('../../../models/community/communityEventModel.js', () => ({
  createCommunityEvent: vi.fn().mockResolvedValue({ success: true, eventId: 1 }),
  addCommunityEventImage: vi.fn().mockResolvedValue({ success: true }),
  getCommunityEventImages: vi.fn().mockResolvedValue({ success: true, images: [] }),
  getAllApprovedEvents: vi.fn().mockResolvedValue({ success: true, events: [] }), // Mock for getApprovedEvents
  getCommunityEventsByUserId: vi.fn().mockResolvedValue({ success: true, events: [] }), // Mock for getMyEvents
  getCommunityEventById: vi.fn().mockResolvedValue({ success: true, event: { id: 1, name: 'Event 1' } }), // Mock for getEventById
  deleteCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event deleted' }), // Mock for deleteEvent
  getCommunityEventImageUrls: vi.fn().mockResolvedValue([]),
}));

describe('createEvent', () => {
  let req, res;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      files: [
        {
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test1'),
          size: 1024
        },
        {
          originalname: 'test2.png',
          mimetype: 'image/png',
          buffer: Buffer.from('test2'),
          size: 2048
        }
      ],
      body: {
        name: 'Test Event',
        location: 'Test Location',
        category: 'sports',
        date: '2025-07-20',
        time: '12:00',
        description: 'Test description',
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });



  it('should return 400 if no images are provided', async () => {
    req.files = [];
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'At least one image is required.'
    }));
  });

  it('should return 201 and eventId with images array on success', async () => {
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      eventId: expect.any(Number),
      images: expect.any(Array)
    }));
  });

  it('should handle single image upload', async () => {
    req.files = [req.files[0]];
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      eventId: expect.any(Number),
      images: expect.any(Array)
    }));
  });
});

describe('getApprovedEvents', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('should return 200 and events on success', async () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    // Mock the model function
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getAllApprovedEvents').mockResolvedValue(mockResult);
    await getApprovedEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 500 if model returns success: false', async () => {
    const mockResult = { success: false, message: 'fail' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getAllApprovedEvents').mockResolvedValue(mockResult);
    await getApprovedEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 500 on error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getAllApprovedEvents').mockRejectedValue(new Error('DB error'));
    await getApprovedEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: expect.any(String), error: expect.any(String) }));
  });
});

describe('getEventById', () => {
  let req, res;
  beforeEach(() => {
    req = { params: { id: '1' } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  });

  it('should return 200 and event on success', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      images: [
        { id: 1, image_url: '/api/s3?key=test1', uploaded_at: '2025-01-01T00:00:00Z' },
        { id: 2, image_url: '/api/s3?key=test2', uploaded_at: '2025-01-01T00:00:01Z' }
      ]
    };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockResolvedValue({ success: true, event: mockEvent });
    await getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, event: mockEvent });
  });

  it('should return 404 if event not found', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockResolvedValue({ success: false, message: 'Event not found' });
    await getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Event not found' });
  });

  it('should return 400 if id is invalid', async () => {
    req.params.id = 'abc';
    await getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid event ID' });
  });

  it('should return 500 on error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockRejectedValue(new Error('DB error'));
    await getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: expect.any(String), error: expect.any(String) }));
  });
});

describe('getMyEvents', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 1 } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  });

  it('should return 200 and events on success', async () => {
    const mockEvents = [{ id: 1, name: 'My Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockResolvedValue(mockResult);
    await getMyEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 401 if user not authenticated', async () => {
    req.user = null;
    await getMyEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized: User not authenticated' });
  });

  it('should return 401 if user ID is missing', async () => {
    req.user = {};
    await getMyEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized: User not authenticated' });
  });

  it('should return 500 if model returns success: false', async () => {
    const mockResult = { success: false, message: 'fail' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockResolvedValue(mockResult);
    await getMyEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 500 on error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockRejectedValue(new Error('DB error'));
    await getMyEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: expect.any(String), error: expect.any(String) }));
  });
});

describe('deleteEvent', () => {
  let req, res;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: { id: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });



  it('should return 401 if user not authenticated', async () => {
    req.user = undefined;
    await deleteEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'User not authenticated'
    }));
  });

  it('should return 200 on successful deletion with images', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue(['/api/s3?key=test1', '/api/s3?key=test2']);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    await deleteEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event deleted successfully'
    }));
  });

  it('should return 200 on successful deletion without images', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue([]);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    await deleteEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event deleted successfully'
    }));
  });

  it('should return 404 if event not found or user does not have permission', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue([]);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(false);

    await deleteEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Event not found or you don't have permission to delete it"
    }));
  });

  it('should handle S3 deletion errors gracefully', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue(['/api/s3?key=test1']);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    // Mock S3 deleteFile to throw an error
    const { deleteFile } = await import('../../../services/s3Service.js');
    deleteFile.mockRejectedValue(new Error('S3 error'));

    await deleteEvent(req, res);

    // Should still succeed even if S3 deletion fails
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event deleted successfully'
    }));
  });

  it('should return 500 on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'deleteCommunityEvent').mockRejectedValue(new Error('DB error'));

    await deleteEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Failed to delete community event'
    }));
  });
});