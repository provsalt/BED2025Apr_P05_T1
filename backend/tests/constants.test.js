import { describe, it, expect } from 'vitest';
import { GENDER, CALORIE_LIMITS, ANALYTICS, HEALTH_SCORES } from '../utils/constants.js';

describe('Constants', () => {
  it('should have correct gender constants', () => {
    expect(GENDER.FEMALE).toBe(0);
    expect(GENDER.MALE).toBe(1);
  });

  it('should have correct calorie limits for females', () => {
    expect(CALORIE_LIMITS.FEMALE.MIN).toBe(1600);
    expect(CALORIE_LIMITS.FEMALE.DEFAULT).toBe(1800);
    expect(CALORIE_LIMITS.FEMALE.MAX).toBe(2000);
  });

  it('should have correct calorie limits for males', () => {
    expect(CALORIE_LIMITS.MALE.MIN).toBe(1800);
    expect(CALORIE_LIMITS.MALE.DEFAULT).toBe(2000);
    expect(CALORIE_LIMITS.MALE.MAX).toBe(2400);
  });

  it('should have valid analytics constants', () => {
    expect(ANALYTICS.MIN_DAYS).toBe(1);
    expect(ANALYTICS.MAX_DAYS).toBe(365);
    expect(ANALYTICS.DEFAULT_DAYS).toBe(7);
    expect(ANALYTICS.VALID_PERIODS).toEqual([7, 14, 30]);
  });

  it('should have health score constants', () => {
    expect(HEALTH_SCORES.DEFAULT_NO_DATA).toBe(50);
    expect(HEALTH_SCORES.DEFAULT_WITH_DATA).toBe(75);
    expect(HEALTH_SCORES.MIN).toBe(0);
    expect(HEALTH_SCORES.MAX).toBe(100);
  });
});
