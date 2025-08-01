import { describe, it, expect, vi, beforeEach } from "vitest";
import * as nutritionModel from "../../../models/nutrition/nutritionModel.js";
import mssql from "mssql";

vi.mock("mssql");
vi.mock("../../../config/db.js", () => ({ dbConfig: {} }));

describe("nutritionModel", () => {
  let mockConnection, mockRequest;

  beforeEach(() => {
    mockRequest = {
      input: vi.fn().mockReturnThis(),
      query: vi.fn()
    };
    mockConnection = {
      request: vi.fn(() => mockRequest),
      close: vi.fn()
    };
    mssql.connect.mockResolvedValue(mockConnection);
  });

  it("createMeal should insert and return new meal", async () => {
    mockRequest.query
      .mockResolvedValueOnce({ recordset: [{ id: 1 }] }) // insert
      .mockResolvedValueOnce({ recordset: [{ id: 1, name: "Test Meal" }] }); // getMealById
    const mealData = { name: "Test Meal", category: "Lunch", carbohydrates: 10, protein: 5, fat: 2, calories: 100, ingredients: "Egg", image_url: "url", user_id: 1 };
    const result = await nutritionModel.createMeal(mealData);
    expect(result).toEqual({ id: 1, name: "Test Meal" });
    expect(mockRequest.input).toHaveBeenCalledWith("name", mssql.NVarChar, mealData.name);
    expect(mockRequest.query).toHaveBeenCalled();
  });

  it("getMealById should return meal if found", async () => {
    mockRequest.query.mockResolvedValue({ recordset: [{ id: 2, name: "Meal2" }] });
    const result = await nutritionModel.getMealById(2);
    expect(result).toEqual({ id: 2, name: "Meal2" });
  });

  it("getAllMeals should return all meals for user", async () => {
    mockRequest.query.mockResolvedValue({ recordset: [{ id: 1 }, { id: 2 }] });
    const result = await nutritionModel.getAllMeals(1);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("deleteMeal should call query with correct id", async () => {
    mockRequest.query.mockResolvedValue({});
    await nutritionModel.deleteMeal(5);
    expect(mockRequest.input).toHaveBeenCalledWith("id", 5);
    expect(mockRequest.query).toHaveBeenCalled();
  });

  it("updateMeal should update and return updated meal", async () => {
    mockRequest.query
      .mockResolvedValueOnce({}) // update
      .mockResolvedValueOnce({ recordset: [{ id: 3, name: "Updated" }] }); // getMealById
    const mealData = { name: "Updated", category: "Dinner", carbohydrates: 20, protein: 10, fat: 5, calories: 200, ingredients: "Chicken" };
    const result = await nutritionModel.updateMeal(3, mealData);
    expect(result).toEqual({ id: 3, name: "Updated" });
  });

  it("searchMeals should return matching meals", async () => {
    mockRequest.query.mockResolvedValue({ recordset: [{ id: 4, name: "Chicken Rice" }] });
    const result = await nutritionModel.searchMeals(1, "Chicken");
    expect(result).toEqual([{ id: 4, name: "Chicken Rice" }]);
  });
});
