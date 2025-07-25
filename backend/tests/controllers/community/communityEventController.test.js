import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createEvent, getApprovedEvents, getEventById } from '../../../controllers/community/communityEventController.js';

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
  getCommunityEventById: vi.fn().mockResolvedValue({ success: true, event: { id: 1, name: 'Event 1' } }), // Mock for getEventById
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

