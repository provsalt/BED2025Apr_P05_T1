// Gender constants
export const GENDER = {
  FEMALE: 0,
  MALE: 1
};

// Calorie limits by gender
export const CALORIE_LIMITS = {
  FEMALE: {
    MIN: 1600,
    DEFAULT: 1800,
    MAX: 2000
  },
  MALE: {
    MIN: 1800,
    DEFAULT: 2000,
    MAX: 2400
  }
};

// Analytics constants
export const ANALYTICS = {
  MIN_DAYS: 1,
  MAX_DAYS: 365,
  DEFAULT_DAYS: 7,
  VALID_PERIODS: [7, 14, 30]
};

// Health score constants
export const HEALTH_SCORES = {
  DEFAULT_NO_DATA: 50,
  DEFAULT_WITH_DATA: 75,
  MIN: 0,
  MAX: 100
};

export default {
  GENDER,
  CALORIE_LIMITS,
  ANALYTICS,
  HEALTH_SCORES
};
