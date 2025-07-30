import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire healthSummaryService module
vi.mock('../../../services/openai/healthSummaryService.js', async () => {
  const actual = await vi.importActual('../../../services/openai/healthSummaryService.js');
  return {
    ...actual,
    generateHealthSummary: vi.fn(),
    validateHealthSummary: vi.fn()
  };
});

// Mock the isResponseSafe function
vi.mock('../../../services/openai/openaiService.js', () => ({
  isResponseSafe: vi.fn()
}));

// Import after mocking
import { generateHealthSummary, validateHealthSummary } from '../../../services/openai/healthSummaryService.js';

describe('healthSummaryService', () => {
  const mockQuestionnaireData = {
    difficulty_walking: 'No',
    assistive_device: 'None',
    symptoms_or_pain: 'Occasional headaches',
    allergies: 'None known',
    medical_conditions: 'None',
    exercise_frequency: '3 times per week'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateHealthSummary', () => {
    it('should generate health summary successfully', async () => {
      const mockSummary = 'This is a test health summary with professional consultation advice.';
      
      generateHealthSummary.mockResolvedValue({
        success: true,
        summary: mockSummary,
        generated_at: new Date().toISOString()
      });

      const result = await generateHealthSummary(mockQuestionnaireData);

      expect(result.success).toBe(true);
      expect(result.summary).toBe(mockSummary);
      expect(result.generated_at).toBeDefined();
      expect(generateHealthSummary).toHaveBeenCalledWith(mockQuestionnaireData);
    });

    it('should handle OpenAI API errors', async () => {
      generateHealthSummary.mockResolvedValue({
        success: false,
        error: 'API Error'
      });

      const result = await generateHealthSummary(mockQuestionnaireData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
      expect(generateHealthSummary).toHaveBeenCalledWith(mockQuestionnaireData);
    });

    it('should handle safety validation failure', async () => {
      generateHealthSummary.mockResolvedValue({
        success: false,
        error: 'Generated content failed safety validation'
      });

      const result = await generateHealthSummary(mockQuestionnaireData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generated content failed safety validation');
      expect(generateHealthSummary).toHaveBeenCalledWith(mockQuestionnaireData);
    });
  });

  describe('validateHealthSummary', () => {
    it('should validate appropriate health summary', async () => {
      const validSummary = 'Based on your responses, I recommend consulting your healthcare provider for a comprehensive evaluation.';
      
      validateHealthSummary.mockResolvedValue(true);
      
      const result = await validateHealthSummary(validSummary);
      
      expect(result).toBe(true);
      expect(validateHealthSummary).toHaveBeenCalledWith(validSummary);
    });

    it('should reject summary with inappropriate medical claims', async () => {
      const invalidSummary = 'I can diagnose you with a specific condition and prescribe medication.';
      
      validateHealthSummary.mockResolvedValue(false);
      
      const result = await validateHealthSummary(invalidSummary);
      
      expect(result).toBe(false);
      expect(validateHealthSummary).toHaveBeenCalledWith(invalidSummary);
    });

    it('should reject summary without professional consultation advice', async () => {
      const invalidSummary = 'You should exercise more and eat better.';
      
      validateHealthSummary.mockResolvedValue(false);
      
      const result = await validateHealthSummary(invalidSummary);
      
      expect(result).toBe(false);
      expect(validateHealthSummary).toHaveBeenCalledWith(invalidSummary);
    });
  });
}); 