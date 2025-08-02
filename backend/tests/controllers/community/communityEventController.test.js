import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createEvent, getApprovedEvents, getMyEvents, getEventById, updateEvent, signUpForEvent, userSignedUpEvents, cancelEventSignup, deleteEvent, getPendingCommunityEventsController, approveCommunityEventController, rejectCommunityEventController } from '../../../controllers/community/communityEventController.js';
import { ErrorFactory } from '../../../utils/AppError.js';

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
  updateCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Community event updated successfully' }), // Mock for updateEvent
  deleteUnwantedImages: vi.fn().mockResolvedValue({ success: true, message: 'Images deleted successfully', deletedUrls: [] }), // Mock for deleteUnwantedImages
  signUpForCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Successfully signed up for event', eventName: 'Test Event' }),
  getUserSignedUpEvents: vi.fn().mockResolvedValue({ success: true, events: [] }),
  cancelCommunityEventSignup: vi.fn().mockResolvedValue({ success: true, message: 'Successfully cancelled event signup' }),
  deleteCommunityEventImage: vi.fn().mockResolvedValue({ success: true, message: 'Image deleted successfully', imageUrl: '/api/s3?key=test-image' }), // Mock for deleteEventImage
  deleteCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event deleted' }), // Mock for deleteEvent
  getCommunityEventImageUrls: vi.fn().mockResolvedValue([]),
  getPendingEvents: vi.fn().mockResolvedValue({ success: true, events: [] }),
  approveCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event approved successfully' }),
  rejectCommunityEvent: vi.fn().mockResolvedValue({ success: true, message: 'Event rejected successfully' }),
}));

describe('createEvent', () => {
  let req, res, next;
  beforeEach(async () => {
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
    
    // Reset S3 mocks
    const { uploadFile } = await import('../../../services/s3Service.js');
    uploadFile.mockClear();
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

  it('should handle time format conversion correctly', async () => {
    req.body.time = '15:30';
    await createEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      eventId: expect.any(Number),
      images: expect.any(Array)
    }));
  });

  it('should handle time format that already has seconds', async () => {
    req.body.time = '15:30:45';
    await createEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      eventId: expect.any(Number),
      images: expect.any(Array)
    }));
  });

  it('should handle database error during event creation', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'createCommunityEvent').mockResolvedValue({
      success: false,
      message: 'Database error'
    });
    await createEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to create community event');
  });

  it('should handle S3 upload error gracefully', async () => {
    const { uploadFile } = await import('../../../services/s3Service.js');
    uploadFile.mockClear(); // Clear previous calls
    uploadFile.mockRejectedValue(new Error('S3 upload failed'));
    
    //reset the model mocks to ensure clean state
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'createCommunityEvent').mockResolvedValue({
      success: true,
      eventId: 1
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({
      success: true
    });
    
    await createEvent(req, res, next);
    
    // Should still succeed even if S3 upload fails for some images
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      eventId: 1,
      images: [] // Should be empty since upload failed
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

  it('should return 200 and approved events on success', async () => {
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

  it('should handle event with no images', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      images: []
    };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockResolvedValue({ success: true, event: mockEvent });
    await getEventById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, event: mockEvent });
  });

  it('should handle event with multiple images', async () => {
    const mockEvent = {
      id: 1,
      name: 'Event 1',
      images: [
        { id: 1, image_url: '/api/s3?key=test1', uploaded_at: '2025-01-01T00:00:00Z' },
        { id: 2, image_url: '/api/s3?key=test2', uploaded_at: '2025-01-01T00:00:01Z' },
        { id: 3, image_url: '/api/s3?key=test3', uploaded_at: '2025-01-01T00:00:02Z' }
      ]
    };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventById').mockResolvedValue({ success: true, event: mockEvent });
    await getEventById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, event: mockEvent });
  });
});

describe('getMyEvents', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { id: 1 } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
  });

  it('should return 200 and display user events on success', async () => {
    const mockEvents = [{ id: 1, name: 'My Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockResolvedValue(mockResult);
    await getMyEvents(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return events with status information', async () => {
    const mockEvents = [
      { id: 1, name: 'My Event 1', status: 'approved' },
      { id: 2, name: 'My Event 2', status: 'pending' }
    ];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventsByUserId').mockResolvedValue(mockResult);
    await getMyEvents(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
    expect(mockEvents[0].status).toBe('approved');
    expect(mockEvents[1].status).toBe('pending');
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
  beforeEach(async () => {
    req = {
      user: { id: 1 },
      params: { id: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    
    // Reset S3 mocks
    const { deleteFile } = await import('../../../services/s3Service.js');
    deleteFile.mockClear();
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
    deleteFile.mockClear(); 
    deleteFile.mockRejectedValue(new Error('S3 error'));

    await deleteEvent(req, res, next);

    // Should still succeed even if S3 deletion fails
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event deleted successfully'
    }));
  });

  it('should handle multiple S3 images deletion', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue([
      '/api/s3?key=test1',
      '/api/s3?key=test2',
      '/api/s3?key=test3'
    ]);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    const { deleteFile } = await import('../../../services/s3Service.js');
    deleteFile.mockClear(); 
    deleteFile.mockResolvedValue();

    await deleteEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event deleted successfully'
    }));
    expect(deleteFile).toHaveBeenCalledTimes(3);
  });

  it('should handle invalid S3 key format gracefully', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getCommunityEventImageUrls').mockResolvedValue(['/api/s3?invalid=format']);
    vi.spyOn(model, 'deleteCommunityEvent').mockResolvedValue(true);

    const { deleteFile } = await import('../../../services/s3Service.js');
    deleteFile.mockClear(); 
    deleteFile.mockResolvedValue();

    await deleteEvent(req, res, next);

    // Should still succeed even if S3 key extraction fails
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

  it('should throw validation error if event ID is invalid', async () => {
    req.params.id = 'abc';
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = {};
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should return 403 if user does not have permission to edit event', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: false,
      message: 'Event not found or you do not have permission to edit this event'
    });
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Event not found or you do not have permission to edit this event');
  });

  it('should return 200 and success message on successful update without new images', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
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
      message: 'Community event updated successfully and pending admin approval',
      newImages: []
    }));
  });

  it('should return 200 and success message with new images on successful update', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
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
      message: 'Community event updated successfully and pending admin approval',
      newImages: expect.any(Array)
    }));
  });

  it('should handle time format conversion correctly', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
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

  it('should verify that update sets event to pending approval', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const updateSpy = vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });

    await updateEvent(req, res, next);

    expect(updateSpy).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'Updated Event',
      location: 'Updated Location',
      category: 'arts',
      date: '2025-07-25',
      time: '14:00:00',
      description: 'Updated description'
    }), 1);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    }));
  });

  it('should pass error to next on model error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: false,
      message: 'Database error'
    });
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should pass error to next on unexpected error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockRejectedValue(new Error('Unexpected error'));
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle image deletion with keepImageIds', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });
    vi.spyOn(model, 'deleteUnwantedImages').mockResolvedValue({
      success: true,
      message: 'Images deleted successfully',
      deletedUrls: ['/api/s3?key=deleted1.jpg', '/api/s3?key=deleted2.jpg']
    });
    vi.spyOn(s3Service, 'deleteFile').mockResolvedValue();
    req.body.keepImageIds = [1, 2]; // Keep images with IDs 1 and 2
    req.files = [];
    await updateEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully and pending admin approval',
      newImages: [],
      deletedImages: expect.arrayContaining(['/api/s3?key=deleted1.jpg', '/api/s3?key=deleted2.jpg'])
    }));
  });

  it('should handle keepImageIds as string JSON', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });
    vi.spyOn(model, 'deleteUnwantedImages').mockResolvedValue({
      success: true,
      message: 'Images deleted successfully',
      deletedUrls: ['/api/s3?key=deleted1.jpg']
    });
    vi.spyOn(s3Service, 'deleteFile').mockResolvedValue();
    req.body.keepImageIds = '[1, 2]'; // String JSON format
    req.files = [];
    await updateEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully and pending admin approval',
      newImages: [],
      deletedImages: expect.arrayContaining(['/api/s3?key=deleted1.jpg'])
    }));
  });

  it('should throw validation error for invalid keepImageIds format', async () => {
    req.body.keepImageIds = 'invalid json';
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid keepImageIds format');
  });

  it('should handle database error in deleteUnwantedImages', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });
    vi.spyOn(model, 'deleteUnwantedImages').mockResolvedValue({
      success: false,
      message: 'Failed to delete unwanted images'
    });
    req.body.keepImageIds = [1, 2];
    req.files = [];
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to delete unwanted images');
  });

  it('should handle S3 upload error when adding new images', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });
    vi.spyOn(model, 'addCommunityEventImage').mockResolvedValue({
      success: true,
      message: 'Image added successfully'
    });
    vi.spyOn(s3Service, 'uploadFile').mockRejectedValue(new Error('S3 upload failed'));
    await updateEvent(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to process uploaded file');
  });

  it('should handle keepImageIds as single integer', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });
    vi.spyOn(model, 'deleteUnwantedImages').mockResolvedValue({
      success: true,
      message: 'Images deleted successfully',
      deletedUrls: ['/api/s3?key=deleted1.jpg']
    });
    vi.spyOn(s3Service, 'deleteFile').mockResolvedValue();
    req.body.keepImageIds = 1; // Single integer
    req.files = [];
    await updateEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully and pending admin approval',
      newImages: [],
      deletedImages: expect.arrayContaining(['/api/s3?key=deleted1.jpg'])
    }));
  });

  it('should handle missing keepImageIds gracefully', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    const s3Service = await import('../../../services/s3Service.js');
    vi.spyOn(model, 'updateCommunityEvent').mockResolvedValue({
      success: true,
      message: 'Community event updated successfully and pending admin approval'
    });
    vi.spyOn(s3Service, 'uploadFile').mockResolvedValue();
    delete req.body.keepImageIds; // No keepImageIds provided
    await updateEvent(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Community event updated successfully and pending admin approval',
      newImages: expect.any(Array)
    }));
  });
});

describe('signUpForEvent', () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: { eventId: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 201 and success message on successful signup', async () => {
    const mockResult = { success: true, message: 'Successfully signed up for event', eventName: 'Test Event' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockResolvedValue(mockResult);

    await signUpForEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = {};

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw validation error if signup event ID is invalid', async () => {
    req.params.eventId = 'abc';

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });

  it('should throw validation error if user already signed up', async () => {
    const mockResult = { success: false, message: 'User is already signed up for this event' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockResolvedValue(mockResult);

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User is already signed up for this event');
  });

  it('should throw not found error if event not found', async () => {
    const mockResult = { success: false, message: 'Event not found' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockResolvedValue(mockResult);

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Event not found');
  });

  it('should throw validation error if event is not approved', async () => {
    const mockResult = { success: false, message: 'Event is not approved' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockResolvedValue(mockResult);

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Event is not approved');
  });

  it('should throw validation error if user tries to sign up for their own event', async () => {
    const mockResult = { success: false, message: 'You cannot sign up for your own event' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockResolvedValue(mockResult);

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('You cannot sign up for your own event');
  });

  it('should throw validation error if event is in the past or happening now', async () => {
    const mockResult = { success: false, message: 'Event is in the past or happening now' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockResolvedValue(mockResult);

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Event is in the past or happening now');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'signUpForCommunityEvent').mockRejectedValue(new Error('DB error'));

    await signUpForEvent(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('userSignedUpEvents', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { id: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and display user signed up events on success', async () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getUserSignedUpEvents').mockResolvedValue(mockResult);

    await userSignedUpEvents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = {};

    await userSignedUpEvents(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw database error if model returns success: false', async () => {
    const mockResult = { success: false, message: 'fail' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getUserSignedUpEvents').mockResolvedValue(mockResult);

    await userSignedUpEvents(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to get user\'s signed up events');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getUserSignedUpEvents').mockRejectedValue(new Error('DB error'));

    await userSignedUpEvents(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return events with signup information', async () => {
    const mockEvents = [
      { 
        id: 1, 
        name: 'Event 1', 
        signed_up_at: '2025-01-01T10:00:00Z',
        created_by_name: 'John Doe'
      },
      { 
        id: 2, 
        name: 'Event 2', 
        signed_up_at: '2025-01-02T10:00:00Z',
        created_by_name: 'Jane Smith'
      }
    ];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getUserSignedUpEvents').mockResolvedValue(mockResult);

    await userSignedUpEvents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
    expect(mockEvents[0].signed_up_at).toBe('2025-01-01T10:00:00Z');
    expect(mockEvents[1].created_by_name).toBe('Jane Smith');
  });

  it('should handle empty events list', async () => {
    const mockResult = { success: true, events: [] };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getUserSignedUpEvents').mockResolvedValue(mockResult);

    await userSignedUpEvents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });
});

describe('cancelEventSignup', () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      params: { eventId: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and success message on successful cancellation', async () => {
    const mockResult = { success: true, message: 'Successfully cancelled event signup' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'cancelCommunityEventSignup').mockResolvedValue(mockResult);

    await cancelEventSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = {};

    await cancelEventSignup(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw validation error if cancel signup event ID is invalid', async () => {
    req.params.eventId = 'abc';

    await cancelEventSignup(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });

  it('should throw validation error if user not signed up', async () => {
    const mockResult = { success: false, message: 'User is not signed up for this event' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'cancelCommunityEventSignup').mockResolvedValue(mockResult);

    await cancelEventSignup(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User is not signed up for this event');
  });

  it('should throw database error if model returns success: false', async () => {
    const mockResult = { success: false, message: 'Database error' };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'cancelCommunityEventSignup').mockResolvedValue(mockResult);

    await cancelEventSignup(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Failed to cancel event signup');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'cancelCommunityEventSignup').mockRejectedValue(new Error('DB error'));

    await cancelEventSignup(req, res, next);

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

  it('should handle empty pending events list', async () => {
    const mockResult = { success: true, events: [] };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getPendingEvents').mockResolvedValue(mockResult);
    await getPendingCommunityEventsController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return pending events with full details', async () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Pending Event 1',
        location: 'Test Location',
        category: 'sports',
        date: '2025-07-20',
        time: '12:00:00',
        description: 'Test description',
        created_by_name: 'John Doe',
        image_url: '/api/s3?key=test-image'
      }
    ];
    const mockResult = { success: true, events: mockEvents };
    const model = await import('../../../models/community/communityEventModel.js');
    vi.spyOn(model, 'getPendingEvents').mockResolvedValue(mockResult);
    await getPendingCommunityEventsController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
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

  it('should call approveCommunityEvent with correct parameters', async () => {
    const mockResult = { success: true, message: 'Event approved successfully' };
    const model = await import('../../../models/community/communityEventModel.js');
    const approveSpy = vi.spyOn(model, 'approveCommunityEvent').mockResolvedValue(mockResult);
    await approveCommunityEventController(req, res, next);
    expect(approveSpy).toHaveBeenCalledWith(1, 1); // eventId, adminId
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle missing eventId in request body', async () => {
    req.body = {};
    await approveCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
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

  it('should call rejectCommunityEvent with correct parameters', async () => {
    const mockResult = { success: true, message: 'Event rejected successfully' };
    const model = await import('../../../models/community/communityEventModel.js');
    const rejectSpy = vi.spyOn(model, 'rejectCommunityEvent').mockResolvedValue(mockResult);
    await rejectCommunityEventController(req, res, next);
    expect(rejectSpy).toHaveBeenCalledWith(1); // eventId
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle missing eventId in request body', async () => {
    req.body = {};
    await rejectCommunityEventController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Invalid event ID');
  });
});
