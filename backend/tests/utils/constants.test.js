import { describe, it, expect } from 'vitest';
import { GENDER, CALORIE_LIMITS, ANALYTICS, HEALTH_SCORES } from '../../utils/constants.js';

describe('Constants', () => {
  describe('GENDER', () => {
    it('should have correct gender values', () => {
      expect(GENDER.FEMALE).toBe(0);
      expect(GENDER.MALE).toBe(1);
    });
  });

  describe('CALORIE_LIMITS', () => {
    it('should have valid female calorie limits', () => {
      expect(CALORIE_LIMITS.FEMALE.MIN).toBe(1600);
      expect(CALORIE_LIMITS.FEMALE.DEFAULT).toBe(1800);
      expect(CALORIE_LIMITS.FEMALE.MAX).toBe(2000);
      expect(CALORIE_LIMITS.FEMALE.MIN).toBeLessThan(CALORIE_LIMITS.FEMALE.DEFAULT);
      expect(CALORIE_LIMITS.FEMALE.DEFAULT).toBeLessThan(CALORIE_LIMITS.FEMALE.MAX);
    });

    it('should have valid male calorie limits', () => {
      expect(CALORIE_LIMITS.MALE.MIN).toBe(1800);
      expect(CALORIE_LIMITS.MALE.DEFAULT).toBe(2000);
      expect(CALORIE_LIMITS.MALE.MAX).toBe(2400);
      expect(CALORIE_LIMITS.MALE.MIN).toBeLessThan(CALORIE_LIMITS.MALE.DEFAULT);
      expect(CALORIE_LIMITS.MALE.DEFAULT).toBeLessThan(CALORIE_LIMITS.MALE.MAX);
    });
  });

  describe('ANALYTICS', () => {
    it('should have valid analytics constants', () => {
      expect(ANALYTICS.MIN_DAYS).toBe(1);
      expect(ANALYTICS.MAX_DAYS).toBe(365);
      expect(ANALYTICS.DEFAULT_DAYS).toBe(7);
      expect(ANALYTICS.VALID_PERIODS).toEqual([7, 14, 30]);
    });
  });

  describe('HEALTH_SCORES', () => {
    it('should have valid health score constants', () => {
      expect(HEALTH_SCORES.DEFAULT_NO_DATA).toBe(50);
      expect(HEALTH_SCORES.DEFAULT_WITH_DATA).toBe(75);
      expect(HEALTH_SCORES.MIN).toBe(0);
      expect(HEALTH_SCORES.MAX).toBe(100);
    });
  });
});

describe('Nutrition Analytics Validation', () => {
  describe('Days parameter validation', () => {
    it('should validate days parameter correctly', () => {
      const validateDays = (days) => {
        return days >= ANALYTICS.MIN_DAYS && days <= ANALYTICS.MAX_DAYS;
      };

      expect(validateDays(0)).toBe(false);
      expect(validateDays(1)).toBe(true);
      expect(validateDays(7)).toBe(true);
      expect(validateDays(365)).toBe(true);
      expect(validateDays(366)).toBe(false);
    });
  });

  describe('Gender validation', () => {
    it('should correctly identify gender', () => {
      const getGenderString = (genderValue) => {
        const gender = parseInt(genderValue);
        return gender === GENDER.FEMALE ? 'female' : 
               gender === GENDER.MALE ? 'male' : 'unknown';
      };

      expect(getGenderString(0)).toBe('female');
      expect(getGenderString('0')).toBe('female');
      expect(getGenderString(1)).toBe('male');
      expect(getGenderString('1')).toBe('male');
      expect(getGenderString(2)).toBe('unknown');
      expect(getGenderString('invalid')).toBe('unknown');
    });
  });
});
