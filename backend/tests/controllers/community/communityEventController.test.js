import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createEvent, getAllEvents } from '../../../controllers/community/communityEventController.js';
import * as communityEventModel from '../../../models/community/communityEventModel.js';

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
  getAllUpcomingEvents: vi.fn(), 
}));

describe('createEvent', () => {
  let req, res;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      file: { mimetype: 'image/jpeg', buffer: Buffer.from('test') },
      validatedBody: {
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

  it('should return 401 if userId is missing', async () => {
    req.user = undefined;
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: expect.stringContaining('Unauthorized') }));
  });

  it('should return 400 if time is missing', async () => {
    req.validatedBody.time = undefined;
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('should return 201 and eventId on success', async () => {
    await createEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, eventId: expect.any(Number), imageUrl: expect.any(String) }));
  });
});

describe('getAllEvents', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('should return 200 and all events on success', async () => {
    const mockEvents = [
      { id: 1, user_id: 1, name: 'Event 1' },
      { id: 2, user_id: 2, name: 'Event 2' }
    ];
    communityEventModel.getAllUpcomingEvents = vi.fn().mockResolvedValueOnce(mockEvents);
    await getAllEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, events: mockEvents });
  });

  it('should return 500 on error', async () => {
    communityEventModel.getAllUpcomingEvents = vi.fn().mockImplementationOnce(() => { throw new Error('Test error'); });
    await getAllEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: expect.stringContaining('Failed to fetch all upcoming events') }));
  });
}); 