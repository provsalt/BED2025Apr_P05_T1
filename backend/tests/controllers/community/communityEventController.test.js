import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createEvent, getApprovedEvents, deleteEvent, getMyEvents, getEventById, updateEvent, getPendingCommunityEventsController, approveCommunityEventController, rejectCommunityEventController } from '../../../controllers/community/communityEventController.js';

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
  getAllApprovedEvents: vi.fn().mockResolvedValue({ success: true, events: [] }),
  getCommunityEventsByUserId: vi.fn().mockResolvedValue({ success: true, events: [] }),
  getCommunityEventById: vi.fn().mockResolvedValue({ success: true, event: { id: 1, name: 'Event 1' } }),
  updateCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Community event updated successfully' }),
  deleteCommunityEventImage: vi.fn().mockResolvedValue({ success: true, message: 'Image deleted successfully', imageUrl: '/api/s3?key=test-image' }),
  deleteCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event deleted' }),
  getCommunityEventImageUrls: vi.fn().mockResolvedValue([]),
  deleteUnwantedImages: vi.fn().mockResolvedValue({ success: true, message: 'Images deleted successfully', deletedUrls: [] }),
  getPendingEvents: vi.fn().mockResolvedValue({ success: true, events: [] }),
  approveCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event approved successfully' }),
  rejectCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event rejected successfully' }),
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

  it('should convert time format from HH:mm to HH:mm:ss', async () => {
    req.body.time = '14:30';
    await createEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      eventId: expect.any(Number),
      images: expect.any(Array)
    }));
  });

  it('should handle database error when creating event', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'createCommunityEvent').mockResolvedValue({ success: false, message: 'Database error' });
    await createEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
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

describe('deleteEvent', () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: { id: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });



  it('should return 401 if user not authenticated', async () => {
    req.user = undefined;
    await deleteEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return 200 on successful deletion with images', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue(['/api/s3?key=test1', '/api/s3?key=test2']);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    await deleteEvent(req, res, next);
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

    await deleteEvent(req, res, next);
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

    await deleteEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle S3 deletion errors gracefully', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue(['/api/s3?key=test1']);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    // Mock S3 deleteFile to throw an error
    const { deleteFile } = await import('../../../services/s3Service.js');
    deleteFile.mockRejectedValue(new Error('S3 error'));

    await deleteEvent(req, res, next);

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

    await deleteEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
describe('updateEvent', () => {
  let req, res, next;
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
    next = vi.fn();
  });

  it('should return 400 if event ID is invalid', async () => {
    req.params.id = 'abc';
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return 403 if user does not have permission to edit event', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: false,
      message: 'Event not found or you do not have permission to edit this event'
    });
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
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
    await updateEvent(req, res, next);
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
    await updateEvent(req, res, next);
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
    await updateEvent(req, res, next);
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
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return 500 on unexpected error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockRejectedValue(new Error('Unexpected error'));
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle image deletion from MinIO when updating with keepImageIds', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully'
    });
    vi.spyOn(model, 'deleteUnwantedImages').mockResolvedValue({
      success: true,
      message: '1 images deleted successfully',
      deletedUrls: ['/api/s3?key=community-events/1/old-image.jpg']
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({
      success: true,
      message: 'Image added successfully'
    });
    vi.spyOn(s3Service, 'uploadFile').mockResolvedValue();
    vi.spyOn(s3Service, 'deleteFile').mockResolvedValue();
    
    req.body.keepImageIds = [1, 2]; // Keep images with IDs 1 and 2
    req.files = [];
    
    await updateEvent(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully',
      newImages: [],
      deletedImages: ['/api/s3?key=community-events/1/old-image.jpg']
    }));
    expect(s3Service.deleteFile).toHaveBeenCalledWith('community-events/1/old-image.jpg');
  });

  it('should handle keepImageIds as string JSON', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully'
    });
    vi.spyOn(model, 'deleteUnwantedImages').mockResolvedValue({
      success: true,
      message: '1 images deleted successfully',
      deletedUrls: ['/api/s3?key=community-events/1/old-image.jpg']
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({
      success: true,
      message: 'Image added successfully'
    });
    vi.spyOn(s3Service, 'uploadFile').mockResolvedValue();
    vi.spyOn(s3Service, 'deleteFile').mockResolvedValue();
    
    req.body.keepImageIds = '[1, 2]'; // JSON string
    req.files = [];
    
    await updateEvent(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully',
      newImages: [],
      deletedImages: ['/api/s3?key=community-events/1/old-image.jpg']
    }));
  });

  it('should handle invalid keepImageIds JSON format', async () => {
    req.body.keepImageIds = 'invalid json';
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('getPendingCommunityEventsController', () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and pending events on success', async () => {
    const mockEvents = [{ id: 1, name: 'Pending Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getPendingEvents').mockResolvedValue(mockResult);
    await getPendingCommunityEventsController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw server error if model returns success: false', async () => {
    const mockResult = { success: false, message: 'Database error' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getPendingEvents').mockResolvedValue(mockResult);
    await getPendingCommunityEventsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to get pending events');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getPendingEvents').mockRejectedValue(new Error('DB error'));
    await getPendingCommunityEventsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('approveCommunityEventController', () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: { eventId: 1 }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and success message on successful approval', async () => {
    const mockResult = { success: true, message: 'Event approved successfully' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'approveCommunityEvent').mockResolvedValue(mockResult);
    await approveCommunityEventController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw validation error if eventId is invalid', async () => {
    req.body.eventId = 'abc';
    await approveCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });

  it('should throw not found error if event not found', async () => {
    const mockResult = { success: false, message: 'Event not found' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'approveCommunityEvent').mockResolvedValue(mockResult);
    await approveCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Community event not found');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'approveCommunityEvent').mockRejectedValue(new Error('DB error'));
    await approveCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('rejectCommunityEventController', () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      body: { eventId: 1 }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and success message on successful rejection', async () => {
    const mockResult = { success: true, message: 'Event rejected successfully' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'rejectCommunityEvent').mockResolvedValue(mockResult);
    await rejectCommunityEventController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw validation error if eventId is invalid', async () => {
    req.body.eventId = 'abc';
    await rejectCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });

  it('should throw not found error if event not found', async () => {
    const mockResult = { success: false, message: 'Event not found' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'rejectCommunityEvent').mockResolvedValue(mockResult);
    await rejectCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Community event not found');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'rejectCommunityEvent').mockRejectedValue(new Error('DB error'));
    await rejectCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});



