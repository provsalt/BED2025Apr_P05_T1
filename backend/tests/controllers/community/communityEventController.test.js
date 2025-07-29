import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createEvent, getApprovedEvents, getMyEvents, getEventById, updateEvent } from '../../../controllers/community/communityEventController.js';

// Ensure S3_BUCKET_NAME is set for all tests
beforeAll(() => {
  process.env.S3_BUCKET_NAME = 'test-bucket';
});

// Mock S3 service
vi.mock('../../../services/s3Service.js', () => ({
  uploadFile: vi.fn().mockResolvedValue(),
  deleteFile: vi.fn().mockResolvedValue(),
}));
vi.mock('../../../models/community/communityEventModel.js', () => ({
  createCommunityEvent: vi.fn().mockResolvedValue({ success: true, eventId: 1 }),
  addCommunityEventImage: vi.fn().mockResolvedValue({ success: true }),
  getCommunityEventImages: vi.fn().mockResolvedValue({ success: true, images: [] }),
  getAllApprovedEvents: vi.fn().mockResolvedValue({ success: true, events: [] }), // Mock for getApprovedEvents
  getCommunityEventsByUserId: vi.fn().mockResolvedValue({ success: true, events: [] }), // Mock for getMyEvents
  getCommunityEventById: vi.fn().mockResolvedValue({ success: true, event: { id: 1, name: 'Event 1' } }), // Mock for getEventById
  updateCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Community event updated successfully' }), // Mock for updateEvent
  deleteCommunityEventImage: vi.fn().mockResolvedValue({ success: true, message: 'Image deleted successfully', imageUrl: '/api/s3?key=test-image' }), // Mock for deleteEventImage
}));

describe('createEvent', () => {
  let req, res, next;
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
    next = vi.fn();
  });



  it('should throw validation error if no images are provided', async () => {
    req.files = [];
    await createEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('At least one image is required.');
  });

  it('should return 201 and eventId with images array on success', async () => {
    await createEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: true, 
      eventId: expect.any(Number), 
      images: expect.any(Array) 
    }));
  });

  it('should handle single image upload', async () => {
    req.files = [req.files[0]];
    await createEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: true, 
      eventId: expect.any(Number), 
      images: expect.any(Array) 
    }));
  });
});

describe('getApprovedEvents', () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and events on success', async () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    // Mock the model function
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getAllApprovedEvents').mockResolvedValue(mockResult);
    await getApprovedEvents(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw database error if model returns success: false', async () => {
    const mockResult = { success: false, message: 'fail' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getAllApprovedEvents').mockResolvedValue(mockResult);
    await getApprovedEvents(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to get approved events');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getAllApprovedEvents').mockRejectedValue(new Error('DB error'));
    await getApprovedEvents(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('getEventById', () => {
  let req, res, next;
  beforeEach(() => {
    req = { params: { id: '1' } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
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
    await getEventById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, event: mockEvent });
  });

  it('should throw not found error if event not found', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockResolvedValue({ success: false, message: 'Event not found' });
    await getEventById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Event not found');
  });

  it('should throw validation error if id is invalid', async () => {
    req.params.id = 'abc';
    await getEventById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockRejectedValue(new Error('DB error'));
    await getEventById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('getMyEvents', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { id: 1 } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
  });

  it('should return 200 and events on success', async () => {
    const mockEvents = [{ id: 1, name: 'My Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockResolvedValue(mockResult);
    await getMyEvents(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });



  it('should throw unauthorized error if user ID is missing', async () => {
    req.user = {};
    await getMyEvents(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw database error if model returns success: false', async () => {
    const mockResult = { success: false, message: 'fail' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockResolvedValue(mockResult);
    await getMyEvents(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to get user events');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockRejectedValue(new Error('DB error'));
    await getMyEvents(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('updateEvent', () => {
  let req, res;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: { id: '1' },
      files: [
        { 
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg', 
          buffer: Buffer.from('test1'),
          size: 1024
        }
      ],
      body: {
        name: 'Updated Event',
        location: 'Updated Location',
        category: 'arts',
        date: '2025-07-25',
        time: '14:00',
        description: 'Updated description',
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('should return 400 if event ID is invalid', async () => {
    req.params.id = 'abc';
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid event ID' });
  });

  it('should return 403 if user does not have permission to edit event', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({ 
      success: false, 
      message: 'Event not found or you do not have permission to edit this event' 
    });
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ 
      success: false, 
      message: 'Event not found or you do not have permission to edit this event' 
    });
  });

  it('should return 200 and success message on successful update without new images', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({ 
      success: true, 
      message: 'Community event updated successfully' 
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({ 
      success: true, 
      message: 'Image added successfully' 
    });
    vi.spyOn(s3Service, 'uploadFile').mockResolvedValue();
    req.files = [];
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: true, 
      message: 'Community event updated successfully',
      newImages: []
    }));
  });

  it('should return 200 and success message with new images on successful update', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({ 
      success: true, 
      message: 'Community event updated successfully' 
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({ 
      success: true, 
      message: 'Image added successfully' 
    });
    vi.spyOn(s3Service, 'uploadFile').mockResolvedValue();
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: true, 
      message: 'Community event updated successfully',
      newImages: expect.any(Array)
    }));
  });

  it('should handle time format conversion correctly', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({ 
      success: true, 
      message: 'Community event updated successfully' 
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({ 
      success: true, 
      message: 'Image added successfully' 
    });
    vi.spyOn(s3Service, 'uploadFile').mockResolvedValue();
    req.body.time = '15:30';
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: true 
    }));
  });

  it('should return 500 on model error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({ 
      success: false, 
      message: 'Database error' 
    });
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      success: false, 
      message: 'Database error' 
    });
  });

  it('should return 500 on unexpected error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockRejectedValue(new Error('Unexpected error'));
    await updateEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      success: false, 
      message: 'Internal server error' 
    }));
  });
});



