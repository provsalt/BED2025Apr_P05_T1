import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as model from '../../../models/medical/medicalModel.js';
import sql from 'mssql';

// Mock OpenAI service 
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

vi.mock('mssql', () => {
  const mockConnection = {
    connect: vi.fn(),
    request: vi.fn().mockReturnThis(),
    input: vi.fn().mockReturnThis(),
    query: vi.fn(),
    close: vi.fn(),
  };
  const fakeType = vi.fn((v) => v);
  return {
    __esModule: true,
    default: {
      connect: vi.fn(),
      Int: fakeType,
      VarChar: fakeType,
      ConnectionPool: vi.fn().mockImplementation(() => mockConnection),
    },
    connect: vi.fn(),
    Int: fakeType,
    VarChar: fakeType,
    ConnectionPool: vi.fn().mockImplementation(() => mockConnection),
  };
});

describe('medicalModel', () => {
  let mockConnection;
  beforeEach(() => {
    mockConnection = {
      request: vi.fn().mockReturnThis(),
      input: vi.fn().mockReturnThis(),
      query: vi.fn(),
      close: vi.fn(),
    };
    sql.connect.mockResolvedValue(mockConnection);
    if (sql.default && sql.default.connect) {
      sql.default.connect.mockResolvedValue(mockConnection);
    }
    if (sql.default) {
      sql.default.connect = sql.connect;
    }
  });

  describe('createMedicationReminder', () => {
    it('should create a medication reminder', async () => {
      mockConnection.query.mockResolvedValueOnce({ recordset: [{ id: 1 }] });
      const result = await model.createMedicationReminder({
        userId: 1,
        medicationName: 'Test',
        reason: 'Test',
        dosage: '1 pill',
        timeToTake: '08:00',
        frequencyPerDay: 1,
        imageUrl: 'url'
      });
      expect(result.success).toBe(true);
      expect(result.medicationId).toBe(1);
    });

    it('should handle DB error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
      const result = await model.createMedicationReminder({
        userId: 1, medicationName: '', reason: '', dosage: '', timeToTake: '', frequencyPerDay: 1, imageUrl: ''
      });
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
    });
  });

  describe('createMedicationQuestion', () => {
    it('should create a medication questionnaire', async () => {
      mockConnection.query.mockResolvedValueOnce({ rowsAffected: [1] });
      const result = await model.createMedicationQuestion(1, {
        difficulty_walking: 'No',
        assistive_device: 'None',
        symptoms_or_pain: 'None',
        allergies: 'None',
        medical_conditions: 'None',
        exercise_frequency: 'Daily'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getMedicationRemindersByUser', () => {
    it('should get medication reminders by user (success)', async () => {
      mockConnection.query.mockResolvedValueOnce({ recordset: [{ id: 1, medicine_name: 'Test' }] });
      const result = await model.getMedicationRemindersByUser(1);
      expect(result.success).toBe(true);
      expect(result.reminders.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle DB error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
      const result = await model.getMedicationRemindersByUser(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
    });
  });

  describe('updateMedicationReminder', () => {
    it('should update a medication reminder (success)', async () => {
      mockConnection.query.mockResolvedValueOnce({ rowsAffected: [1] });
      const result = await model.updateMedicationReminder(1, {
        medicationName: 'Test', reason: 'Test', dosage: '1 pill', timeToTake: '08:00', frequencyPerDay: 1, imageUrl: 'url'
      });
      expect(result.success).toBe(true);
    });

    it('should handle DB error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
      const result = await model.updateMedicationReminder(1, {
        medicationName: '', reason: '', dosage: '', timeToTake: '', frequencyPerDay: 1, imageUrl: ''
      });
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
    });
  });

  describe('deleteMedicationReminder', () => {
    it('should delete a medication reminder (success)', async () => {
      mockConnection.query.mockResolvedValueOnce({ rowsAffected: [1] });
      const result = await model.deleteMedicationReminder(1, 1);
      expect(result.success).toBe(true);
    });

    it('should return not found', async () => {
      mockConnection.query.mockResolvedValueOnce({ rowsAffected: [0] });
      const result = await model.deleteMedicationReminder(1, 1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not found/);
    });

    it('should handle DB error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
      const result = await model.deleteMedicationReminder(1, 1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Failed/);
    });
  });
}); 