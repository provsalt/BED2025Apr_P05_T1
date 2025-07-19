import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as controller from '../../../controllers/medical/medicalController.js';
import * as model from '../../../models/medical/medicalModel.js';

vi.mock('../../../models/medical/medicalModel.js', () => ({
  createMedicationReminder: vi.fn(),
  getMedicationRemindersByUser: vi.fn(),
  updateMedicationReminder: vi.fn(),
  deleteMedicationReminder: vi.fn(),
  createMedicationQuestion: vi.fn(),
}));

describe('medicalController', () => {
  let req, res;
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

  it('should return 400 if userId missing in createMedication', async () => {
    req.user = {};
    await controller.createMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

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

  it('should return 200 and reminders on getMedicationReminders success', async () => {
    model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
    await controller.getMedicationReminders(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should return 400 if userId missing in getMedicationReminders', async () => {
    req.user = {};
    await controller.getMedicationReminders(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 on getMedicationReminders DB error', async () => {
    model.getMedicationRemindersByUser.mockResolvedValue({ success: false, message: 'fail', error: 'fail' });
    await controller.getMedicationReminders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should return 200 on updateMedication success', async () => {
    model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [{ id: 1, image_url: 'url' }] });
    model.updateMedicationReminder.mockResolvedValue({ success: true });
    req.params.id = 1;
    req.validatedBody = {
      medicine_name: 'Test', reason: 'Test', dosage: '1 pill', medicine_time: '08:00', frequency_per_day: 1
    };
    await controller.updateMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 404 if reminder not found in updateMedication', async () => {
    model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [] });
    req.params.id = 999;
    await controller.updateMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 if userId missing in updateMedication', async () => {
    req.user = {};
    await controller.updateMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 on updateMedication DB error', async () => {
    model.getMedicationRemindersByUser.mockResolvedValue({ success: true, reminders: [{ id: 1, image_url: 'url' }] });
    model.updateMedicationReminder.mockResolvedValue({ success: false, message: 'fail', error: 'fail' });
    req.params.id = 1;
    await controller.updateMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should return 200 on deleteMedication success', async () => {
    model.deleteMedicationReminder.mockResolvedValue({ success: true });
    req.params.id = 1;
    await controller.deleteMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 404 on deleteMedication not found', async () => {
    model.deleteMedicationReminder.mockResolvedValue({ success: false, message: 'not found' });
    req.params.id = 1;
    await controller.deleteMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 400 if userId missing in deleteMedication', async () => {
    req.user = {};
    await controller.deleteMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if reminderId missing in deleteMedication', async () => {
    req.params.id = undefined;
    await controller.deleteMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 500 on deleteMedication DB error', async () => {
    model.deleteMedicationReminder.mockRejectedValue(new Error('fail'));
    req.params.id = 1;
    await controller.deleteMedication(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
}); 