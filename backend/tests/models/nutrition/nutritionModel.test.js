import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMeal, 
  getMealById, 
  getAllMeals, 
  deleteMeal, 
  updateMeal, 
  searchMeals 
} from '../../../models/nutrition/nutritionModel.js';

// Mock mssql
vi.mock('mssql', () => ({
  default: {
    connect: vi.fn(),
    NVarChar: 'NVarChar',
    Decimal: vi.fn(() => 'Decimal'),
    Int: 'Int',
  },
}));

// Mock db config
vi.mock('../../../config/db.js', () => ({
  dbConfig: {
    server: 'test-server',
    database: 'test-db',
    user: 'test-user',
    password: 'test-password',
  },
}));

describe('createMeal', () => {
  let mockConnection, mockRequest;

  beforeEach(async () => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockResolvedValue({
        recordset: [{ id: 1 }]
      }),
    };

    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn().mockResolvedValue(),
    };

    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
  });

  it('should create a meal successfully', async () => {
    const mealData = {
      name: 'Test Food',
      category: 'Test Category',
      carbohydrates: 25.5,
      protein: 15.2,
      fat: 8.1,
      calories: 250,
      ingredients: 'ingredient1, ingredient2',
      image_url: 'http://example.com/image.jpg',
      user_id: 1
    };

    const result = await createMeal(mealData);

    expect(mockConnection.request).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith('name', 'NVarChar', mealData.name);
    expect(mockRequest.input).toHaveBeenCalledWith('category', 'NVarChar', mealData.category);
    expect(mockRequest.input).toHaveBeenCalledWith('carbohydrates', 'Decimal', 25.5);
    expect(mockRequest.input).toHaveBeenCalledWith('protein', 'Decimal', 15.2);
    expect(mockRequest.input).toHaveBeenCalledWith('fat', 'Decimal', 8.1);
    expect(mockRequest.input).toHaveBeenCalledWith('calories', 'Decimal', 250);
    expect(mockRequest.input).toHaveBeenCalledWith('ingredients', 'NVarChar', mealData.ingredients);
    expect(mockRequest.input).toHaveBeenCalledWith('image_url', 'NVarChar', mealData.image_url);
    expect(mockRequest.input).toHaveBeenCalledWith('user_id', 'Int', mealData.user_id);
    expect(mockRequest.query).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    const mealData = {
      name: 'Test Food',
      category: 'Test Category',
      carbohydrates: 25.5,
      protein: 15.2,
      fat: 8.1,
      calories: 250,
      ingredients: 'ingredient1, ingredient2',
      image_url: 'http://example.com/image.jpg',
      user_id: 1
    };

    mockRequest.query.mockRejectedValue(new Error('Database error'));

    await expect(createMeal(mealData)).rejects.toThrow('Database error');
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle connection close errors', async () => {
    const mealData = {
      name: 'Test Food',
      category: 'Test Category',
      carbohydrates: 25.5,
      protein: 15.2,
      fat: 8.1,
      calories: 250,
      ingredients: 'ingredient1, ingredient2',
      image_url: 'http://example.com/image.jpg',
      user_id: 1
    };

    mockConnection.close.mockRejectedValue(new Error('Close error'));

    const result = await createMeal(mealData);
    expect(result).toBeDefined();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});

describe('getMealById', () => {
  let mockConnection, mockRequest;

  beforeEach(async () => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockResolvedValue({
        recordset: [{ id: 1, name: 'Test Food' }]
      }),
    };

    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn().mockResolvedValue(),
    };

    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
  });

  it('should get a meal by ID successfully', async () => {
    const result = await getMealById(1);

    expect(mockConnection.request).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith('id', 1);
    expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Meal WHERE id = @id');
    expect(result).toEqual({ id: 1, name: 'Test Food' });
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should return null when meal not found', async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result = await getMealById(999);

    expect(result).toBeNull();
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockRequest.query.mockRejectedValue(new Error('Database error'));

    await expect(getMealById(1)).rejects.toThrow('Database error');
    expect(mockConnection.close).toHaveBeenCalled();
  });
});

describe('getAllMeals', () => {
  let mockConnection, mockRequest;

  beforeEach(async () => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockResolvedValue({
        recordset: [
          { id: 1, name: 'Test Food 1' },
          { id: 2, name: 'Test Food 2' }
        ]
      }),
    };

    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn().mockResolvedValue(),
    };

    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
  });

  it('should get all meals for a user successfully', async () => {
    const result = await getAllMeals(1);

    expect(mockConnection.request).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith('userId', 1);
    expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Meal WHERE user_id = @userId ORDER BY scanned_at DESC');
    expect(result).toEqual([
      { id: 1, name: 'Test Food 1' },
      { id: 2, name: 'Test Food 2' }
    ]);
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should return empty array when no meals found', async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result = await getAllMeals(1);

    expect(result).toEqual([]);
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockRequest.query.mockRejectedValue(new Error('Database error'));

    await expect(getAllMeals(1)).rejects.toThrow('Database error');
    expect(mockConnection.close).toHaveBeenCalled();
  });
});

describe('deleteMeal', () => {
  let mockConnection, mockRequest;

  beforeEach(async () => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockResolvedValue({}),
    };

    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn().mockResolvedValue(),
    };

    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
  });

  it('should delete a meal successfully', async () => {
    await deleteMeal(1);

    expect(mockConnection.request).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith('id', 1);
    expect(mockRequest.query).toHaveBeenCalledWith('DELETE FROM Meal WHERE id = @id');
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockRequest.query.mockRejectedValue(new Error('Database error'));

    await expect(deleteMeal(1)).rejects.toThrow('Database error');
    expect(mockConnection.close).toHaveBeenCalled();
  });
});

describe('updateMeal', () => {
  let mockConnection, mockRequest;

  beforeEach(async () => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockResolvedValue({}),
    };

    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn().mockResolvedValue(),
    };

    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
  });

  it('should update a meal successfully', async () => {
    const mealData = {
      name: 'Updated Food',
      category: 'Updated Category',
      carbohydrates: 30.0,
      protein: 20.0,
      fat: 10.0,
      calories: 300,
      ingredients: 'updated ingredient1, updated ingredient2'
    };

    // Mock the query to return proper recordset for getMealById call
    mockRequest.query.mockResolvedValue({
      recordset: [{ id: 1, ...mealData }]
    });

    const result = await updateMeal(1, mealData);

    expect(mockConnection.request).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith('id', 1);
    expect(mockRequest.input).toHaveBeenCalledWith('name', 'NVarChar', mealData.name);
    expect(mockRequest.input).toHaveBeenCalledWith('category', 'NVarChar', mealData.category);
    expect(mockRequest.input).toHaveBeenCalledWith('carbohydrates', 'Decimal', 30.0);
    expect(mockRequest.input).toHaveBeenCalledWith('protein', 'Decimal', 20.0);
    expect(mockRequest.input).toHaveBeenCalledWith('fat', 'Decimal', 10.0);
    expect(mockRequest.input).toHaveBeenCalledWith('calories', 'Decimal', 300);
    expect(mockRequest.input).toHaveBeenCalledWith('ingredients', 'NVarChar', mealData.ingredients);
    expect(mockRequest.query).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, ...mealData });
  });

  it('should handle database errors', async () => {
    const mealData = {
      name: 'Updated Food',
      category: 'Updated Category',
      carbohydrates: 30.0,
      protein: 20.0,
      fat: 10.0,
      calories: 300,
      ingredients: 'updated ingredient1, updated ingredient2'
    };

    mockRequest.query.mockRejectedValue(new Error('Database error'));

    await expect(updateMeal(1, mealData)).rejects.toThrow('Database error');
    expect(mockConnection.close).toHaveBeenCalled();
  });
});

describe('searchMeals', () => {
  let mockConnection, mockRequest;

  beforeEach(async () => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockResolvedValue({
        recordset: [
          { id: 1, name: 'Chicken Rice' },
          { id: 2, name: 'Chicken Curry' }
        ]
      }),
    };

    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn().mockResolvedValue(),
    };

    const mssql = await import('mssql');
    mssql.default.connect.mockResolvedValue(mockConnection);
  });

  it('should search meals successfully', async () => {
    const result = await searchMeals(1, 'chicken');

    expect(mockConnection.request).toHaveBeenCalled();
    expect(mockRequest.input).toHaveBeenCalledWith('userId', 1);
    expect(mockRequest.input).toHaveBeenCalledWith('searchTerm', '%chicken%');
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM Meal'));
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = @userId'));
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('AND name LIKE @searchTerm'));
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY scanned_at DESC'));
    expect(result).toEqual([
      { id: 1, name: 'Chicken Rice' },
      { id: 2, name: 'Chicken Curry' }
    ]);
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should return empty array when no meals found', async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result = await searchMeals(1, 'nonexistent');

    expect(result).toEqual([]);
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockRequest.query.mockRejectedValue(new Error('Database error'));

    await expect(searchMeals(1, 'chicken')).rejects.toThrow('Database error');
    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle special characters in search term', async () => {
    const result = await searchMeals(1, 'chicken%');

    expect(mockRequest.input).toHaveBeenCalledWith('searchTerm', '%chicken%%');
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
