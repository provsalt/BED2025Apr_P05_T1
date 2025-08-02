import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as controller from '../../../controllers/medical/medicalController.js';
import * as model from '../../../models/medical/medicalModel.js';
import { MAX_REMINDERS_PER_USER } from '../../../utils/validation/medical.js';

// Mock OpenAI services
vi.mock('../../../services/openai/healthSummaryService.js', () => ({
  generateHealthSummary: vi.fn().mockResolvedValue({
    success: true,
    summary: 'Mock health summary for testing',
    generated_at: new Date().toISOString()
  }),
  validateHealthSummary: vi.fn().mockResolvedValue(true)
}));

vi.mock('../../../services/openai/openaiService.js', () => ({
  analyzeFoodImage: vi.fn().mockResolvedValue({
    food_name: 'Mock food',
    calories: 100,
    protein: 5,
    carbs: 10,
    fat: 2
  }),
  moderateContent: vi.fn().mockResolvedValue({
    flagged: false,
    categories: {},
    categoryScores: {},
    safe: true
  }),
  isResponseSafe: vi.fn().mockResolvedValue(true)
}));

// Mock S3 service before importing controller
vi.mock('../../../services/s3Service.js', () => ({
  uploadFile: vi.fn().mockResolvedValue(),
  deleteFile: vi.fn().mockResolvedValue()
}));

vi.mock('../../../models/medical/medicalModel.js', () => ({
  createMedicationReminder: vi.fn(),
  getMedicationRemindersByUser: vi.fn(),
  updateMedicationReminder: vi.fn(),
  deleteMedicationReminder: vi.fn(),
  createMedicationQuestion: vi.fn(),
}));

vi.mock('../../../utils/AppError.js', () => ({
  ErrorFactory: {
    validation: vi.fn((message) => new Error(message)),
    unauthorized: vi.fn((message) => new Error(message)),
    notFound: vi.fn((resource) => new Error(`${resource} not found`)),
    database: vi.fn((message, details) => new Error(message)),
  }
}));

let req, res, next;

describe('medicalController', () => {
  beforeEach(() => {
    req = {
      user: { id: 1 },
      file: { buffer: Buffer.from('test') },
      params: { id: 1 },
      body: {
        medicine_name: 'Test',
        reason: 'Test',
        dosage: '1 pill',
        medicine_time: '08:00',
        frequency_per_day: 1,
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('createMedication', () => {
    it('should call next with unauthorized error if userId missing', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.user = {};
      await controller.createMedication(req, res, next);
      expect(ErrorFactory.unauthorized).toHaveBeenCalledWith('User not authenticated');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error if image file missing', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.file = null;
      await controller.createMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Image file is required');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error for missing required fields', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.body.medicine_name = '';
      await controller.createMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('All fields (medicine_name, reason, dosage, medicine_time, frequency_per_day) are required');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error if frequency_per_day exceeds max', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.body.frequency_per_day = 99;
      await controller.createMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Frequency per day must be between 1 and 3');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error if user already has max reminders', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: Array(MAX_REMINDERS_PER_USER).fill({}) });
      await controller.createMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith(`You can only have up to ${MAX_REMINDERS_PER_USER} medication reminders`);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 201 on successful creation', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
      model.createMedicationReminder.mockResolvedValue({ success: true, id: 1 });
      await controller.createMedication(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, id: 1 });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with database error if creation fails', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
      model.createMedicationReminder.mockResolvedValue({ success: false, message: 'DB error' });
      await controller.createMedication(req, res, next);
      expect(ErrorFactory.database).toHaveBeenCalledWith('Failed to create medication reminder', 'DB error');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  

  describe('getMedicationReminders', () => {
    it('should return 200 and reminders on success', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
      await controller.getMedicationReminders(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with unauthorized error if userId missing', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.user = {};
      await controller.getMedicationReminders(req, res, next);
      expect(ErrorFactory.unauthorized).toHaveBeenCalledWith('User not authenticated');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with database error on DB error', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.getMedicationRemindersByUser.mockResolvedValue({ success: false, message: 'fail' });
      await controller.getMedicationReminders(req, res, next);
      expect(ErrorFactory.database).toHaveBeenCalledWith('Failed to retrieve medication reminders', 'fail');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('updateMedication', () => {
    it('should return 200 on success', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [{ id: 1, image_url: 'url' }] });
      model.updateMedicationReminder.mockResolvedValue({ success: true });
      req.params.id = 1;
      req.body = {
        medicine_name: 'Test', reason: 'Test', dosage: '1 pill', medicine_time: '08:00', frequency_per_day: 1
      };
      req.file = undefined;
      await controller.updateMedication(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with unauthorized error if userId missing', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.user = {};
      await controller.updateMedication(req, res, next);
      expect(ErrorFactory.unauthorized).toHaveBeenCalledWith('User not authenticated');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error for invalid reminder ID', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.params.id = 'invalid';
      await controller.updateMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Valid reminder ID is required');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error if frequency_per_day exceeds max', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.body.frequency_per_day = 99;
      await controller.updateMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Frequency per day must be between 1 and 3');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with notFound error if reminder not found', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
      req.params.id = 999;
      await controller.updateMedication(req, res, next);
      expect(ErrorFactory.notFound).toHaveBeenCalledWith('Medication reminder');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with database error on DB error', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [{ id: 1, image_url: 'url' }] });
      model.updateMedicationReminder.mockResolvedValue({ success: false, message: 'fail' });
      req.params.id = 1;
      await controller.updateMedication(req, res, next);
      expect(ErrorFactory.database).toHaveBeenCalledWith('Failed to update medication reminder', 'fail');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('deleteMedication', () => {
    it('should return 200 on success', async () => {
      model.deleteMedicationReminder.mockResolvedValue({ success: true });
      req.params.id = 1;
      await controller.deleteMedication(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with unauthorized error if userId missing', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.user = {};
      await controller.deleteMedication(req, res, next);
      expect(ErrorFactory.unauthorized).toHaveBeenCalledWith('User not authenticated');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error if reminderId missing', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.params.id = undefined;
      await controller.deleteMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Valid reminder ID is required');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with validation error for invalid reminderId', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.params.id = 'invalid';
      await controller.deleteMedication(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('Valid reminder ID is required');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with notFound error if reminder not found', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.deleteMedicationReminder.mockResolvedValue({ success: false, message: 'not found' });
      req.params.id = 1;
      await controller.deleteMedication(req, res, next);
      expect(ErrorFactory.notFound).toHaveBeenCalledWith('Medication reminder');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with error on DB error', async () => {
      const serverError = new Error('fail');
      model.deleteMedicationReminder.mockRejectedValue(serverError);
      req.params.id = 1;
      await controller.deleteMedication(req, res, next);
      expect(next).toHaveBeenCalledWith(serverError);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('submitMedicationQuestionnaire', () => {
    it('should return 200 on successful questionnaire submission', async () => {
      model.createMedicationQuestion.mockResolvedValue({ success: true });
      req.body = {
        difficulty_walking: 'No',
        assistive_device: 'None',
        symptoms_or_pain: 'None',
        allergies: 'None',
        medical_conditions: 'None',
        exercise_frequency: 'Daily'
      };
      await controller.submitMedicationQuestionnaire(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with validation error for missing required fields', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      req.body = {
        difficulty_walking: 'No',
        // Missing other required fields
      };
      await controller.submitMedicationQuestionnaire(req, res, next);
      expect(ErrorFactory.validation).toHaveBeenCalledWith('All questionnaire fields are required');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with database error on questionnaire DB error', async () => {
      const { ErrorFactory } = await import('../../../utils/AppError.js');
      model.createMedicationQuestion.mockResolvedValue({ success: false, message: 'fail' });
      req.body = {
        difficulty_walking: 'No',
        assistive_device: 'None',
        symptoms_or_pain: 'None',
        allergies: 'None',
        medical_conditions: 'None',
        exercise_frequency: 'Daily'
      };
      await controller.submitMedicationQuestionnaire(req, res, next);
      expect(ErrorFactory.database).toHaveBeenCalledWith('Failed to submit questionnaire', 'fail');
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});