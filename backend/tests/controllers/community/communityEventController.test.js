import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEvent } from '../../../controllers/community/communityEventController.js';

vi.mock('../../../backend/services/s3Service.js', () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));
vi.mock('../../../backend/models/community/communityEventModel.js', () => ({
  createCommunityEvent: vi.fn().mockResolvedValue({ success: true, eventId: 1 }),
  addCommunityEventImage: vi.fn().mockResolvedValue({ success: true }),
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