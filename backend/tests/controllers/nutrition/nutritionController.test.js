import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { 
  uploadNutritionImage, 
  retrieveMeals, 
  retrieveMealsById, 
  removeMeal, 
  amendMeal, 
  searchMealsController 
} from '../../../controllers/nutrition/mealImageController.js';

// Ensure S3_BUCKET_NAME is set for all tests
beforeAll(() => {
  process.env.S3_BUCKET_NAME = 'test-bucket';
  process.env.BACKEND_URL = 'http://localhost:3000';
});

// Mock S3 service
vi.mock('../../../services/s3Service.js', () => ({
  uploadFile: vi.fn().mockResolvedValue(),
  deleteFile: vi.fn().mockResolvedValue(),
}));

// Mock OpenAI service
vi.mock('../../../services/openai/openaiService.js', () => ({
  analyzeFoodImage: vi.fn().mockResolvedValue({
    name: 'Test Food',
    category: 'Test Category',
    carbohydrates: 25.5,
    protein: 15.2,
    fat: 8.1,
    calories: 250,
    ingredients: ['ingredient1', 'ingredient2']
  }),
}));

// Mock UUID
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid-123'),
}));

// Mock nutrition model
vi.mock('../../../models/nutrition/nutritionModel.js', () => ({
  createMeal: vi.fn().mockResolvedValue({ id: 1, name: 'Test Food' }),
  getMealById: vi.fn().mockResolvedValue({ id: 1, name: 'Test Food', user_id: 1 }),
  getAllMeals: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Food' }]),
  deleteMeal: vi.fn().mockResolvedValue(),
  updateMeal: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Food' }),
  searchMeals: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Food' }]),
}));

// Mock ErrorFactory
vi.mock('../../../utils/AppError.js', () => ({
  ErrorFactory: {
    validation: vi.fn((message) => new Error(message)),
    unauthorized: vi.fn((message) => new Error(message)),
    forbidden: vi.fn((message) => new Error(message)),
    notFound: vi.fn((resource) => new Error(`${resource} not found`)),
    external: vi.fn((service, message, details) => new Error(message)),
  },
}));

describe('uploadNutritionImage', () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      user: { id: 1 },
      file: {
        originalname: 'test-food.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test-image'),
        size: 1024
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should throw validation error if no file uploaded', async () => {
    req.file = null;
    await uploadNutritionImage(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('No file uploaded');
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = null;
    await uploadNutritionImage(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should return 200 and success message on successful upload', async () => {
    await uploadNutritionImage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Food image uploaded successfully',
      url: expect.any(String),
      s3Key: expect.any(String),
      analysis: expect.any(Object)
    }));
  });

  it('should handle OpenAI analysis error', async () => {
    const { analyzeFoodImage } = await import('../../../services/openai/openaiService.js');
    analyzeFoodImage.mockRejectedValue(new Error('Analysis failed'));
    
    await uploadNutritionImage(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('retrieveMeals', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { id: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and meals on success', async () => {
    const mockMeals = [{ id: 1, name: 'Test Food' }];
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getAllMeals').mockResolvedValue(mockMeals);
    
    await retrieveMeals(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Meals retrieved successfully',
      meals: mockMeals
    });
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = null;
    await retrieveMeals(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getAllMeals').mockRejectedValue(new Error('DB error'));
    
    await retrieveMeals(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('retrieveMealsById', () => {
  let req, res, next;
  beforeEach(() => {
    req = { 
      user: { id: 1 },
      params: { id: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and meal on success', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 1 };
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    
    await retrieveMealsById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Meal retrieved successfully',
      meal: mockMeal
    });
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = null;
    await retrieveMealsById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw not found error if meal not found', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(null);
    
    await retrieveMealsById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Meal not found');
  });

  it('should throw forbidden error if meal does not belong to user', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 2 }; // Different user
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    
    await retrieveMealsById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Access denied');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockRejectedValue(new Error('DB error'));
    
    await retrieveMealsById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('removeMeal', () => {
  let req, res, next;
  beforeEach(() => {
    req = { 
      user: { id: 1 },
      params: { id: '1' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and success message on successful deletion', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 1 };
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    vi.spyOn(model, 'deleteMeal').mockResolvedValue();
    
    await removeMeal(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Meal deleted successfully'
    });
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = null;
    await removeMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw not found error if meal not found', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(null);
    
    await removeMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Meal not found');
  });

  it('should throw forbidden error if meal does not belong to user', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 2 }; // Different user
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    
    await removeMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Access denied');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockRejectedValue(new Error('DB error'));
    
    await removeMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('amendMeal', () => {
  let req, res, next;
  beforeEach(() => {
    req = { 
      user: { id: 1 },
      params: { id: '1' },
      body: {
        name: 'Updated Food',
        category: 'Updated Category',
        carbohydrates: 30.0,
        protein: 20.0,
        fat: 10.0,
        calories: 300,
        ingredients: 'updated ingredient1, updated ingredient2'
      }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and success message on successful update', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 1 };
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    vi.spyOn(model, 'updateMeal').mockResolvedValue({ id: 1, name: 'Updated Food' });
    
    await amendMeal(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Meal updated successfully'
    });
  });

  it('should handle array ingredients correctly', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 1 };
    req.body.ingredients = ['ingredient1', 'ingredient2'];
    
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    vi.spyOn(model, 'updateMeal').mockResolvedValue({ id: 1, name: 'Updated Food' });
    
    await amendMeal(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = null;
    await amendMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw not found error if meal not found', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(null);
    
    await amendMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Meal not found');
  });

  it('should throw forbidden error if meal does not belong to user', async () => {
    const mockMeal = { id: 1, name: 'Test Food', user_id: 2 }; // Different user
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockResolvedValue(mockMeal);
    
    await amendMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Access denied');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'getMealById').mockRejectedValue(new Error('DB error'));
    
    await amendMeal(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('searchMealsController', () => {
  let req, res, next;
  beforeEach(() => {
    req = { 
      user: { id: 1 },
      query: { name: 'chicken' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 200 and search results on success', async () => {
    const mockMeals = [{ id: 1, name: 'Chicken Rice' }];
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'searchMeals').mockResolvedValue(mockMeals);
    
    await searchMealsController(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Search completed successfully',
      meals: mockMeals,
      searchTerm: 'chicken',
      count: 1
    });
  });

  it('should throw unauthorized error if user not authenticated', async () => {
    req.user = null;
    await searchMealsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('User not authenticated');
  });

  it('should throw validation error if search term is missing', async () => {
    req.query.name = '';
    await searchMealsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Search term is required');
  });

  it('should throw validation error if search term is only whitespace', async () => {
    req.query.name = '   ';
    await searchMealsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Search term is required');
  });

  it('should throw not found error if no meals found', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'searchMeals').mockResolvedValue([]);
    
    await searchMealsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Meals not found');
  });

  it('should pass error to next on database error', async () => {
    const model = await import('../../../models/nutrition/nutritionModel.js');
    vi.spyOn(model, 'searchMeals').mockRejectedValue(new Error('DB error'));
    
    await searchMealsController(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
