import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as controller from '../../../controllers/medical/medicalController.js';
import * as model from '../../../models/medical/medicalModel.js';

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

let req, res;

describe('medicalController', () => {
  beforeEach(() => {
    req = {
      user: { id: 1 },
      file: {},
      params: { id: 1 },
      validatedBody: {
        medicine_name: 'Test',
        reason: 'Test',
        dosage: '1 pill',
        medicine_time: '08:00',
        frequency_per_day: 1,
      },
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('createMedication', () => {
    it('should return 400 if userId missing', async () => {
      req.user = {};
      await controller.createMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  

  describe('getMedicationReminders', () => {
    it('should return 200 and reminders on success', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
      await controller.getMedicationReminders(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 400 if userId missing', async () => {
      req.user = {};
      await controller.getMedicationReminders(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on DB error', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: false, message: 'fail', error: 'fail' });
      await controller.getMedicationReminders(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateMedication', () => {
    it('should return 200 on success', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [{ id: 1, image_url: 'url' }] });
      model.updateMedicationReminder.mockResolvedValue({ success: true });
      req.params.id = 1;
      req.validatedBody = {
        medicine_name: 'Test', reason: 'Test', dosage: '1 pill', medicine_time: '08:00', frequency_per_day: 1
      };
      req.file = undefined;
      await controller.updateMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if reminder not found', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
      req.params.id = 999;
      await controller.updateMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if userId missing', async () => {
      req.user = {};
      await controller.updateMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on DB error', async () => {
      model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [{ id: 1, image_url: 'url' }] });
      model.updateMedicationReminder.mockResolvedValue({ success: false, message: 'fail', error: 'fail' });
      req.params.id = 1;
      await controller.updateMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteMedication', () => {
    it('should return 200 on success', async () => {
      model.deleteMedicationReminder.mockResolvedValue({ success: true });
      req.params.id = 1;
      await controller.deleteMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 on not found', async () => {
      model.deleteMedicationReminder.mockResolvedValue({ success: false, message: 'not found' });
      req.params.id = 1;
      await controller.deleteMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if userId missing', async () => {
      req.user = {};
      await controller.deleteMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if reminderId missing', async () => {
      req.params.id = undefined;
      await controller.deleteMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on DB error', async () => {
      model.deleteMedicationReminder.mockRejectedValue(new Error('fail'));
      req.params.id = 1;
      await controller.deleteMedication(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('submitMedicationQuestionnaire', () => {
    it('should return 200 on successful questionnaire submission', async () => {
      model.createMedicationQuestion.mockResolvedValue({ success: true });
      req.validatedBody = {
        difficulty_walking: 'No',
        assistive_device: 'None',
        symptoms_or_pain: 'None',
        allergies: 'None',
        medical_conditions: 'None',
        exercise_frequency: 'Daily'
      };
      await controller.submitMedicationQuestionnaire(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 500 on questionnaire DB error', async () => {
      model.createMedicationQuestion.mockResolvedValue({ success: false, message: 'fail', error: 'fail' });
      req.validatedBody = {
        difficulty_walking: 'No',
        assistive_device: 'None',
        symptoms_or_pain: 'None',
        allergies: 'None',
        medical_conditions: 'None',
        exercise_frequency: 'Daily'
      };
      await controller.submitMedicationQuestionnaire(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});