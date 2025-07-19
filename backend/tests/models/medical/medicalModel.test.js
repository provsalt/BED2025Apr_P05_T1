import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as model from '../../../models/medical/medicalModel.js';
import sql from 'mssql';

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

  it('should handle DB error in createMedicationReminder', async () => {
    mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
    const result = await model.createMedicationReminder({
      userId: 1, medicationName: '', reason: '', dosage: '', timeToTake: '', frequencyPerDay: 1, imageUrl: ''
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
  });

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

  it('should get medication reminders by user (success)', async () => {
    mockConnection.query.mockResolvedValueOnce({ recordset: [{ id: 1, medicine_name: 'Test' }] });
    const result = await model.getMedicationRemindersByUser(1);
    expect(result.success).toBe(true);
    expect(result.reminders.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle DB error in getMedicationRemindersByUser', async () => {
    mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
    const result = await model.getMedicationRemindersByUser(1);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
  });

  it('should update a medication reminder (success)', async () => {
    mockConnection.query.mockResolvedValueOnce({ rowsAffected: [1] });
    const result = await model.updateMedicationReminder(1, {
      medicationName: 'Test', reason: 'Test', dosage: '1 pill', timeToTake: '08:00', frequencyPerDay: 1, imageUrl: 'url'
    });
    expect(result.success).toBe(true);
  });

  it('should handle DB error in updateMedicationReminder', async () => {
    mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
    const result = await model.updateMedicationReminder(1, {
      medicationName: '', reason: '', dosage: '', timeToTake: '', frequencyPerDay: 1, imageUrl: ''
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
  });

  it('should delete a medication reminder (success)', async () => {
    mockConnection.query.mockResolvedValueOnce({ rowsAffected: [1] });
    const result = await model.deleteMedicationReminder(1, 1);
    expect(result.success).toBe(true);
  });

  it('should return not found for deleteMedicationReminder', async () => {
    mockConnection.query.mockResolvedValueOnce({ rowsAffected: [0] });
    const result = await model.deleteMedicationReminder(1, 1);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/);
  });

  it('should handle DB error in deleteMedicationReminder', async () => {
    mockConnection.query.mockRejectedValueOnce(new Error('DB fail'));
    const result = await model.deleteMedicationReminder(1, 1);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Failed/);
  });
}); 